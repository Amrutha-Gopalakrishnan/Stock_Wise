import { products as seedProducts, suppliers as seedSuppliers, alerts as seedAlerts, transactions as seedTransactions } from "@/data/dummyData";

const idCounters = new Map();

const nextId = (prefix) => {
  const current = idCounters.get(prefix) ?? 0;
  const next = current + 1;
  idCounters.set(prefix, next);
  return `${prefix}-${String(next).padStart(4, "0")}`;
};

const unique = (arr) => [...new Set(arr)];

const staffUser = {
  id: nextId("user"),
  full_name: "Jamie Staff",
  role: "staff",
};

const adminUser = {
  id: nextId("user"),
  full_name: "Alex Admin",
  role: "admin",
};

const mockDb = {
  categories: [],
  suppliers: [],
  products: [],
  stock_levels: [],
  stock_transactions: [],
  alerts: [],
  users: [staffUser, adminUser],
  audit_logs: [],
};

const categoryLookup = unique(seedProducts.map((p) => p.category)).map((name) => ({
  id: nextId("cat"),
  name,
}));
mockDb.categories = categoryLookup;

mockDb.suppliers = seedSuppliers.map((supplier) => ({
  id: nextId("sup"),
  name: supplier.name,
  contact_phone: supplier.phone,
  contact_email: supplier.contact,
  address: supplier.address ?? "Not specified",
}));

const supplierByIndex = (index) => mockDb.suppliers[index % mockDb.suppliers.length];

mockDb.products = seedProducts.map((product, index) => {
  const category = mockDb.categories.find((c) => c.name === product.category) ?? mockDb.categories[0];
  const supplier = supplierByIndex(index);
  return {
    id: nextId("prod"),
    name: product.name,
    sku: product.sku,
    unit_price: product.price,
    category_id: category.id,
    supplier_id: supplier.id,
    reorder_threshold: product.threshold,
    reorder_quantity: Math.max(product.threshold * 2, 10),
  };
});

mockDb.stock_levels = mockDb.products.map((product, index) => ({
  id: nextId("stock"),
  product_id: product.id,
  current_quantity: seedProducts[index]?.stock ?? 0,
}));

const transactionTypeForChange = (quantity) => {
  if (quantity > 0) return "in";
  if (quantity < 0) return "out";
  return "adjustment";
};

const absoluteQuantity = (quantity) => Math.abs(quantity);

mockDb.stock_transactions = seedTransactions.map((transaction, index) => {
  const product = mockDb.products[index % mockDb.products.length];
  const type = transactionTypeForChange(transaction.quantity);
  return {
    id: nextId("txn"),
    product_id: product.id,
    transaction_type: type,
    quantity: absoluteQuantity(transaction.quantity),
    reason: transaction.reason,
    logged_by: staffUser.id,
    created_at: new Date(transaction.date ?? Date.now() - index * 86400000).toISOString(),
  };
});

mockDb.alerts = seedAlerts.map((alert, index) => {
  const product = mockDb.products[index % mockDb.products.length];
  return {
    id: nextId("alert"),
    product_id: product.id,
    status: alert.status,
    alert_type: "low_stock",
    created_at: new Date(Date.now() - index * 43200000).toISOString(),
  };
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const hydrateRow = (table, row) => {
  if (!row) return row;
  if (table === "products") {
    const category = mockDb.categories.find((c) => c.id === row.category_id) ?? null;
    const supplier = mockDb.suppliers.find((s) => s.id === row.supplier_id) ?? null;
    const stockLevel = mockDb.stock_levels.find((sl) => sl.product_id === row.id) ?? null;
    return {
      ...row,
      categories: category ? { id: category.id, name: category.name } : null,
      suppliers: supplier ? { id: supplier.id, name: supplier.name } : null,
      stock_levels: stockLevel ? { current_quantity: stockLevel.current_quantity } : null,
    };
  }
  if (table === "stock_transactions") {
    const product = mockDb.products.find((p) => p.id === row.product_id);
    const user = mockDb.users.find((u) => u.id === row.logged_by);
    return {
      ...row,
      products: product ? { id: product.id, name: product.name } : null,
      users: user ? { id: user.id, full_name: user.full_name } : null,
    };
  }
  if (table === "alerts") {
    const product = mockDb.products.find((p) => p.id === row.product_id);
    return {
      ...row,
      products: product ? { id: product.id, name: product.name } : null,
    };
  }
  return row;
};

const execute = (table, state) => {
  let rows = mockDb[table] ?? [];
  rows = rows.map((row) => clone(row));

  state.filters.forEach(({ column, value }) => {
    rows = rows.filter((row) => row[column] === value);
  });

  if (state.order) {
    const { column, ascending } = state.order;
    rows.sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return ascending ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return ascending ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  if (Number.isFinite(state.limit)) {
    rows = rows.slice(0, state.limit);
  }

  return rows.map((row) => hydrateRow(table, row));
};

const createQueryBuilder = (table) => {
  const state = {
    table,
    filters: [],
    order: null,
    limit: undefined,
    workingRows: null,
  };

  const builder = {
    select() {
      return builder;
    },
    order(column, options = {}) {
      state.order = { column, ascending: options.ascending !== false };
      return builder;
    },
    eq(column, value) {
      state.filters.push({ column, value });
      return builder;
    },
    limit(value) {
      state.limit = value;
      return builder;
    },
    maybeSingle() {
      const rows = (state.workingRows ?? execute(table, state));
      const data = rows.length > 0 ? rows[0] : null;
      return Promise.resolve({ data, error: null });
    },
    single() {
      const rows = (state.workingRows ?? execute(table, state));
      const data = rows.length > 0 ? rows[0] : null;
      if (!data) {
        return Promise.resolve({
          data: null,
          error: new Error("No rows"),
        });
      }
      return Promise.resolve({ data, error: null });
    },
    insert(payload) {
      const payloadArray = Array.isArray(payload) ? payload : [payload];
      const inserted = payloadArray.map((item) => {
        const value = { ...item };
        if (!value.id) {
          value.id = nextId(table.slice(0, 3));
        }
        if (table === "stock_levels") {
          const existing = mockDb.stock_levels.find((sl) => sl.product_id === value.product_id);
          if (existing) {
            existing.current_quantity = value.current_quantity;
            return clone(existing);
          }
        }
        mockDb[table].push(value);
        return clone(value);
      });
      state.filters = [];
      state.order = null;
      state.limit = undefined;
      state.workingRows = inserted.map((row) => hydrateRow(table, row));
      return builder;
    },
    update(patch) {
      const rows = execute(table, state);
      rows.forEach((row) => {
        const original = mockDb[table].find((item) => item.id === row.id);
        if (original) {
          Object.assign(original, patch);
        }
      });
      return builder;
    },
    then(resolve, reject) {
      try {
        const rows = state.workingRows ?? execute(table, state);
        const payload = { data: rows, error: null };
        state.workingRows = null;
        return Promise.resolve(payload).then(resolve, reject);
      } catch (err) {
        if (reject) {
          return Promise.reject(err).catch(reject);
        }
        throw err;
      }
    },
  };

  return builder;
};

const handleRpc = async (fn, args) => {
  if (fn !== "fn_record_stock_transaction") {
    console.warn(`Mock RPC called for ${fn}. Returning empty payload.`);
    return { data: null, error: null };
  }

  const {
    p_product_id: productId,
    p_transaction_type: type,
    p_quantity: quantity,
    p_reason: reason,
    p_logged_by: loggedBy,
  } = args ?? {};

  if (!productId) {
    return {
      data: null,
      error: new Error("Product ID is required"),
    };
  }

  const normalizedQty = Math.abs(Number(quantity) || 0);
  const delta = type === "in" ? normalizedQty : type === "out" ? -normalizedQty : normalizedQty;

  let stockRow = mockDb.stock_levels.find((row) => row.product_id === productId);
  if (!stockRow) {
    stockRow = { id: nextId("stock"), product_id: productId, current_quantity: 0 };
    mockDb.stock_levels.push(stockRow);
  }
  stockRow.current_quantity = Math.max(0, stockRow.current_quantity + delta);

  const transactionRow = {
    id: nextId("txn"),
    product_id: productId,
    transaction_type: type,
    quantity: normalizedQty,
    reason: reason ?? null,
    logged_by: loggedBy ?? staffUser.id,
    created_at: new Date().toISOString(),
  };

  mockDb.stock_transactions.unshift(transactionRow);

  return {
    data: [{ transaction_id: transactionRow.id, new_stock: stockRow.current_quantity }],
    error: null,
  };
};

export function createMockSupabaseClient() {
  const channel = () => ({
    on() {
      return this;
    },
    subscribe() {
      return this;
    },
  });

  return {
    from(table) {
      return createQueryBuilder(table);
    },
    rpc: handleRpc,
    channel,
    removeChannel() {},
    auth: {
      async getUser() {
        return { data: { user: { id: staffUser.id } }, error: null };
      },
    },
  };
}

export const mockSupabaseMeta = {
  staffUserId: staffUser.id,
};

