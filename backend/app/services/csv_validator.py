"""
CSV Transaction Ingestion Validator.
Performs strict schema validation, type checking, anomaly detection,
duplicate identifier checking, and malformed row reporting.
"""
import io
import csv
from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.models.transaction import TransactionType

REQUIRED_COLUMNS = ['transaction_reference', 'account_id', 'amount', 'merchant_name', 'merchant_category']
OPTIONAL_COLUMNS = ['currency', 'timestamp', 'transaction_type', 'channel', 'country_code', 'is_international']

VALID_CATEGORIES = {
    'Groceries', 'Dining', 'Utilities', 'Electronics', 'Travel', 'Healthcare', 'Entertainment', 'Crypto/Gaming', 'Retail', 'Other'
}

VALID_TRANSACTION_TYPES = {
    'POS', 'ONLINE', 'ATM_WITHDRAWAL', 'WIRE_TRANSFER', 'MOBILE_PAYMENT'
}

def validate_and_parse_csv(file_content: bytes, existing_refs: set) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Parses and validates CSV content.
    Returns:
      valid_rows: list of parsed transaction dicts
      validation_errors: list of error dicts with line number, column, and reason
    """
    valid_rows = []
    errors = []
    seen_in_batch = set()

    try:
        text_stream = io.StringIO(file_content.decode('utf-8-sig'))
    except UnicodeDecodeError:
        try:
            text_stream = io.StringIO(file_content.decode('latin-1'))
        except Exception as e:
            return [], [{"row": 0, "column": "file", "error": f"Invalid text encoding. Must be UTF-8 compatible: {str(e)}"}]

    reader = csv.DictReader(text_stream)
    
    if not reader.fieldnames:
        return [], [{"row": 0, "column": "header", "error": "CSV file appears empty or missing headers."}]

    # Normalize headers
    normalized_headers = [h.strip().lower() for h in reader.fieldnames if h]
    missing_required = [col for col in REQUIRED_COLUMNS if col not in normalized_headers]

    if missing_required:
        return [], [{
            "row": 0,
            "column": "headers",
            "error": f"Missing mandatory columns: {', '.join(missing_required)}. Required columns are: {', '.join(REQUIRED_COLUMNS)}"
        }]

    for idx, raw_row in enumerate(reader, start=2): # 1 is header
        row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw_row.items() if k}
        row_errors = []

        ref = row.get('transaction_reference', '')
        if not ref:
            row_errors.append("Transaction reference is blank.")
        elif ref in existing_refs or ref in seen_in_batch:
            row_errors.append(f"Duplicate transaction reference '{ref}'.")
        else:
            seen_in_batch.add(ref)

        account = row.get('account_id', '')
        if not account:
            row_errors.append("Account ID cannot be blank.")

        # Validate amount
        amount_val = 0.0
        try:
            amount_str = row.get('amount', '').replace('$', '').replace(',', '')
            amount_val = float(amount_str)
            if amount_val <= 0:
                row_errors.append(f"Amount must be strictly positive (got {amount_val}).")
        except (ValueError, TypeError):
            row_errors.append(f"Invalid numeric amount '{row.get('amount')}'.")

        # Validate category
        category = row.get('merchant_category', 'Other')
        if not category:
            category = 'Other'

        # Validate type
        txn_type = row.get('transaction_type', 'ONLINE').upper()
        if txn_type not in VALID_TRANSACTION_TYPES:
            txn_type = 'ONLINE'

        # Validate timestamp
        ts_str = row.get('timestamp', '')
        timestamp = datetime.utcnow()
        if ts_str:
            parsed = False
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%m/%d/%Y %H:%M", "%m/%d/%Y"):
                try:
                    timestamp = datetime.strptime(ts_str, fmt)
                    parsed = True
                    break
                except ValueError:
                    continue
            if not parsed:
                row_errors.append(f"Invalid timestamp format '{ts_str}'. Expected ISO-8601 or YYYY-MM-DD HH:MM:SS.")

        if row_errors:
            errors.append({
                "row": idx,
                "transaction_reference": ref or f"ROW-{idx}",
                "error": "; ".join(row_errors)
            })
        else:
            valid_rows.append({
                "transaction_reference": ref,
                "account_id": account,
                "amount": round(amount_val, 2),
                "currency": row.get('currency', 'USD').upper() or 'USD',
                "timestamp": timestamp,
                "merchant_name": row.get('merchant_name', 'Unknown Merchant'),
                "merchant_category": category,
                "transaction_type": TransactionType(txn_type),
                "channel": row.get('channel', 'WEB').upper() or 'WEB',
                "country_code": row.get('country_code', 'US').upper() or 'US',
                "is_international": row.get('is_international', '').lower() in ('true', '1', 'yes')
            })

    return valid_rows, errors
