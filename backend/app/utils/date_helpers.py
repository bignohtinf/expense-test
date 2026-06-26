"""
Date range helpers for index-friendly queries.

PostgreSQL cannot use B-tree indexes on `transaction_date` when
EXTRACT(month/year, ...) wraps the column. Replacing with explicit
date-range filters lets the planner do an Index Scan instead of a
Seq Scan.

    BAD  → WHERE EXTRACT(month FROM tx_date) = 6
           AND EXTRACT(year FROM tx_date) = 2026
    GOOD → WHERE tx_date >= '2026-06-01'
           AND tx_date < '2026-07-01'
"""

from datetime import date
from calendar import monthrange


def month_date_range(month: int, year: int):
    """Return [start, end) for a given month.

    Returns:
        (first_day_inclusive, first_day_of_next_month_exclusive)
    """
    start = date(year, month, 1)
    _, last_day = monthrange(year, month)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return start, end
