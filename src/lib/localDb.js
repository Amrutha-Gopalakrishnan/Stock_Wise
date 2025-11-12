const STORAGE_PREFIX = "stockwise_localdb_";

const memoryStore = {};

const safeStructuredClone = (value) => {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readRawTable = (table) => {
  const storage = getStorage();
  if (storage) {
    const raw = storage.getItem(`${STORAGE_PREFIX}${table}`);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      storage.removeItem(`${STORAGE_PREFIX}${table}`);
    }
    return [];
  }
  if (!memoryStore[table]) {
    memoryStore[table] = [];
  }
  return memoryStore[table];
};

const writeRawTable = (table, data) => {
  const storage = getStorage();
  if (storage) {
    storage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(data));
    return;
  }
  memoryStore[table] = data;
};

const generateLocalId = (table) =>
  `local-${table}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const cloneRecords = (records) => safeStructuredClone(records);

export const listRecords = (table) => cloneRecords(readRawTable(table));

export const insertRecord = (table, record) => {
  const records = readRawTable(table);
  const now = new Date().toISOString();
  const localId = record?.localId ?? generateLocalId(table);
  const newRecord = {
    ...record,
    localId,
    remoteId: record?.remoteId ?? null,
    synced: record?.synced ?? false,
    createdAtLocal: record?.createdAtLocal ?? now,
    updatedAtLocal: now,
    lastSyncedAt: record?.lastSyncedAt ?? null,
  };
  records.push(newRecord);
  writeRawTable(table, records);
  return safeStructuredClone(newRecord);
};

export const updateRecord = (table, localId, patch) => {
  const records = readRawTable(table);
  const index = records.findIndex((item) => item.localId === localId);
  if (index === -1) return null;
  const now = new Date().toISOString();
  const updated = {
    ...records[index],
    ...patch,
    updatedAtLocal: now,
  };
  records[index] = updated;
  writeRawTable(table, records);
  return safeStructuredClone(updated);
};

export const removeRecord = (table, localId) => {
  const records = readRawTable(table);
  const next = records.filter((item) => item.localId !== localId);
  writeRawTable(table, next);
};

export const markSynced = (table, localId, remoteId, patch = {}) => {
  return updateRecord(table, localId, {
    ...patch,
    remoteId: remoteId ?? null,
    synced: true,
    lastSyncedAt: new Date().toISOString(),
  });
};

export const upsertRemoteRecords = (table, remoteRecords, options = {}) => {
  const { remoteIdKey = "id", transform = (item) => item } = options;
  const records = readRawTable(table);
  const now = new Date().toISOString();

  remoteRecords.forEach((remoteItem) => {
    const transformed = transform(remoteItem);
    const remoteId = transformed?.remoteId ?? remoteItem?.[remoteIdKey];
    if (!remoteId) return;
    const existingIndex = records.findIndex((item) => item.remoteId === remoteId);
    const baseRecord = {
      ...transformed,
      remoteId,
      synced: true,
      lastSyncedAt: now,
      updatedAtLocal: now,
    };
    if (existingIndex === -1) {
      records.push({
        ...baseRecord,
        localId: generateLocalId(table),
        createdAtLocal: now,
      });
    } else {
      records[existingIndex] = {
        ...records[existingIndex],
        ...baseRecord,
      };
    }
  });

  writeRawTable(table, records);
  return cloneRecords(records);
};

export const findRecordByRemoteId = (table, remoteId) => {
  if (!remoteId) return null;
  const records = readRawTable(table);
  const found = records.find((item) => item.remoteId === remoteId);
  return found ? safeStructuredClone(found) : null;
};

export const clearTable = (table) => {
  writeRawTable(table, []);
};

const resolveRecordId = (record) => record.remoteId ?? record.id ?? record.localId;

const mapProductRecord = (record) => ({
  id: resolveRecordId(record),
  name: record.name,
  sku: record.sku,
  unit_price: record.unit_price,
  category_name: record.category_name ?? "—",
  supplier_name: record.supplier_name ?? "—",
  current_quantity: record.current_quantity ?? 0,
  category_id: record.category_id ?? null,
  supplier_id: record.supplier_id ?? null,
  reorder_threshold: record.reorder_threshold ?? null,
  reorder_quantity: record.reorder_quantity ?? null,
  _localId: record.localId,
  _synced: record.synced ?? false,
});

const mapCategoryRecord = (record) => ({
  id: resolveRecordId(record),
  name: record.name,
  _localId: record.localId,
  _synced: record.synced ?? false,
});

const mapSupplierRecord = (record) => ({
  id: resolveRecordId(record),
  name: record.name,
  contact_phone: record.contact_phone ?? null,
  contact_email: record.contact_email ?? null,
  address: record.address ?? null,
  _localId: record.localId,
  _synced: record.synced ?? false,
});

const findById = (records, id) =>
  records.find(
    (record) => record.remoteId === id || record.id === id || record.localId === id,
  );

const mapStockTransactionRecord = (record) => ({
  id: resolveRecordId(record),
  product_id: record.product_id ?? null,
  transaction_type: record.transaction_type ?? "adjustment",
  quantity: record.quantity ?? 0,
  reason: record.reason ?? null,
  logged_by: record.logged_by ?? null,
  created_at: record.created_at ?? record.createdAtLocal ?? new Date().toISOString(),
  _localId: record.localId,
  _synced: record.synced ?? false,
});

const mapUserRecord = (record) => ({
  id: resolveRecordId(record),
  full_name: record.full_name ?? "Staff User",
  role: record.role ?? "staff",
  email: record.email ?? null,
  _localId: record.localId,
  _synced: record.synced ?? false,
});

const upsertGeneric = (table, mapper) => (payload) => {
  const id = payload?.id ?? null;
  if (id) {
    const existing = findRecordByRemoteId(table, id);
    if (existing) {
      const updated = markSynced(table, existing.localId, id, {
        ...existing,
        ...payload,
      });
      return mapper(updated);
    }
  }
  const inserted = insertRecord(table, {
    ...payload,
    remoteId: id ?? null,
    synced: Boolean(id),
  });
  return mapper(inserted);
};

const upsertProductRecord = upsertGeneric("products", mapProductRecord);
const upsertCategoryRecord = upsertGeneric("categories", mapCategoryRecord);
const upsertSupplierRecord = upsertGeneric("suppliers", mapSupplierRecord);

const saveCollection = (table, records, mapper) => {
  upsertRemoteRecords(table, records, {
    transform: (item) => ({
      ...item,
      remoteId: item.id,
      synced: true,
    }),
  });
  return listRecords(table).map(mapper);
};

const getCollection = (table, mapper) => listRecords(table).map(mapper);

const updateProductStock = (productId, quantity) => {
  const records = listRecords("products");
  const found = findById(records, productId);
  if (found) {
    updateRecord("products", found.localId, { current_quantity: quantity });
  } else {
    insertRecord("products", {
      remoteId: productId ?? null,
      current_quantity: quantity,
    });
  }
};

const appendStockTransaction = (payload) => {
  const { product_id, transaction_type, quantity } = payload;
  const records = listRecords("products");
  const productRecord = product_id ? findById(records, product_id) : null;
  const currentQuantity = productRecord?.current_quantity ?? 0;
  const delta =
    transaction_type === "in"
      ? quantity
      : transaction_type === "out"
      ? -quantity
      : quantity;
  const newQuantity = Math.max(0, currentQuantity + delta);

  if (productRecord) {
    updateRecord("products", productRecord.localId, { current_quantity: newQuantity });
  }

  const insertedTransaction = insertRecord("stock_transactions", {
    ...payload,
    synced: Boolean(payload?.id),
    remoteId: payload?.id ?? null,
  });

  return {
    transaction: mapStockTransactionRecord(insertedTransaction),
    newStock: newQuantity,
  };
};

const persistStockTransactions = (records) => {
  upsertRemoteRecords("stock_transactions", records, {
    transform: (item) => ({
      ...item,
      remoteId: item.id,
      synced: true,
    }),
  });
  return listRecords("stock_transactions").map(mapStockTransactionRecord);
};

const retrieveStockTransactions = () =>
  listRecords("stock_transactions").map(mapStockTransactionRecord);

const upsertUserRecord = upsertGeneric("users", mapUserRecord);

const getStaffUser = () => {
  const users = listRecords("users");
  const staff =
    users.find((user) => (user.role ?? "staff").toLowerCase() === "staff") ?? users[0];
  return staff ? mapUserRecord(staff) : null;
};

export const localDb = {
  insertRecord,
  updateRecord,
  removeRecord,
  markSynced,
  upsertRemoteRecords,
  findRecordByRemoteId,
  listRecords,
  clearTable,
  getProducts: () => getCollection("products", mapProductRecord),
  saveProducts: (records) => saveCollection("products", records, mapProductRecord),
  upsertProduct: (record) => upsertProductRecord(record),
  setStockLevel: (productId, quantity) => updateProductStock(productId, quantity),
  getCategories: () => getCollection("categories", mapCategoryRecord),
  saveCategories: (records) => saveCollection("categories", records, mapCategoryRecord),
  upsertCategory: (record) => upsertCategoryRecord(record),
  getSuppliers: () => getCollection("suppliers", mapSupplierRecord),
  saveSuppliers: (records) => saveCollection("suppliers", records, mapSupplierRecord),
  upsertSupplier: (record) => upsertSupplierRecord(record),
  addStockTransaction: (record) => appendStockTransaction(record),
  saveStockTransactions: (records) => persistStockTransactions(records),
  getStockTransactions: () => retrieveStockTransactions(),
  upsertUser: (record) => upsertUserRecord(record),
  getStaffUser: () => getStaffUser(),
  getUsers: () => listRecords("users").map(mapUserRecord),
};

