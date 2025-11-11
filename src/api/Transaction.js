// src/api/transactions.js
import { supabase } from "../supabaseClient";

/**
 * Call stored procedure fn_record_stock_transaction.
 * Expects the Supabase auth user id to be passed as logged_by (UUID).
 */
export async function recordStockTransaction({ product_id, type, quantity, reason, logged_by }) {
  const { data, error } = await supabase.rpc("fn_record_stock_transaction", {
    p_product_id: product_id,
    p_transaction_type: type,
    p_quantity: quantity,
    p_reason: reason,
    p_logged_by: logged_by,
  });

  if (error) throw error;
  return data; // array with object containing transaction_id & new_stock
}
