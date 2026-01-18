-- =====================================================
-- MIGRATION 008: Pocket Balance Auto-Update Triggers
-- Description: Automatically update pocket.current_balance when donation/expense items change
-- Date: 2026-01-18
-- =====================================================

-- =====================================================
-- FUNCTION: Update Pocket Balance
-- =====================================================

-- Function to recalculate and update pocket balance
CREATE OR REPLACE FUNCTION update_pocket_balance(pocket_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_donations NUMERIC(15,2);
  total_expenses NUMERIC(15,2);
  new_balance NUMERIC(15,2);
BEGIN
  -- Calculate total donations for this pocket
  SELECT COALESCE(SUM(di.amount), 0)
  INTO total_donations
  FROM donations d
  JOIN donation_items di ON di.donation_id = d.id
  WHERE d.pocket_id = pocket_uuid;

  -- Calculate total expenses for this pocket
  SELECT COALESCE(SUM(ei.amount), 0)
  INTO total_expenses
  FROM expenses e
  JOIN expense_items ei ON ei.expense_id = e.id
  WHERE e.pocket_id = pocket_uuid
    AND e.status = 'approved'; -- Only count approved expenses

  -- Calculate new balance
  new_balance := total_donations - total_expenses;

  -- Update pocket balance
  UPDATE pockets
  SET current_balance = new_balance,
      updated_at = NOW()
  WHERE id = pocket_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_pocket_balance IS 'Recalculates and updates pocket balance based on donations and approved expenses';

-- =====================================================
-- TRIGGERS: Auto-update on donation_items changes
-- =====================================================

-- Trigger function for donation items
CREATE OR REPLACE FUNCTION trigger_update_pocket_balance_on_donation_item()
RETURNS TRIGGER AS $$
DECLARE
  affected_pocket_id UUID;
BEGIN
  -- Determine which pocket to update
  IF TG_OP = 'DELETE' THEN
    SELECT pocket_id INTO affected_pocket_id
    FROM donations WHERE id = OLD.donation_id;
  ELSE
    SELECT pocket_id INTO affected_pocket_id
    FROM donations WHERE id = NEW.donation_id;
  END IF;

  -- Update the pocket balance
  IF affected_pocket_id IS NOT NULL THEN
    PERFORM update_pocket_balance(affected_pocket_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for donation_items
DROP TRIGGER IF EXISTS update_pocket_on_donation_item_insert ON donation_items;
CREATE TRIGGER update_pocket_on_donation_item_insert
  AFTER INSERT ON donation_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_donation_item();

DROP TRIGGER IF EXISTS update_pocket_on_donation_item_update ON donation_items;
CREATE TRIGGER update_pocket_on_donation_item_update
  AFTER UPDATE ON donation_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_donation_item();

DROP TRIGGER IF EXISTS update_pocket_on_donation_item_delete ON donation_items;
CREATE TRIGGER update_pocket_on_donation_item_delete
  AFTER DELETE ON donation_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_donation_item();

-- =====================================================
-- TRIGGERS: Auto-update on expense_items changes
-- =====================================================

-- Trigger function for expense items
CREATE OR REPLACE FUNCTION trigger_update_pocket_balance_on_expense_item()
RETURNS TRIGGER AS $$
DECLARE
  affected_pocket_id UUID;
BEGIN
  -- Determine which pocket to update
  IF TG_OP = 'DELETE' THEN
    SELECT pocket_id INTO affected_pocket_id
    FROM expenses WHERE id = OLD.expense_id;
  ELSE
    SELECT pocket_id INTO affected_pocket_id
    FROM expenses WHERE id = NEW.expense_id;
  END IF;

  -- Update the pocket balance
  IF affected_pocket_id IS NOT NULL THEN
    PERFORM update_pocket_balance(affected_pocket_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for expense_items
DROP TRIGGER IF EXISTS update_pocket_on_expense_item_insert ON expense_items;
CREATE TRIGGER update_pocket_on_expense_item_insert
  AFTER INSERT ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_expense_item();

DROP TRIGGER IF EXISTS update_pocket_on_expense_item_update ON expense_items;
CREATE TRIGGER update_pocket_on_expense_item_update
  AFTER UPDATE ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_expense_item();

DROP TRIGGER IF EXISTS update_pocket_on_expense_item_delete ON expense_items;
CREATE TRIGGER update_pocket_on_expense_item_delete
  AFTER DELETE ON expense_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_expense_item();

-- =====================================================
-- TRIGGERS: Auto-update on expense approval status change
-- =====================================================

-- Trigger function for expense status changes
CREATE OR REPLACE FUNCTION trigger_update_pocket_balance_on_expense_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if status changed to/from approved
  IF OLD.status != NEW.status AND (OLD.status = 'approved' OR NEW.status = 'approved') THEN
    PERFORM update_pocket_balance(NEW.pocket_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for expense status changes
DROP TRIGGER IF EXISTS update_pocket_on_expense_status_change ON expenses;
CREATE TRIGGER update_pocket_on_expense_status_change
  AFTER UPDATE OF status ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_expense_status();

-- =====================================================
-- TRIGGERS: Auto-update when donation/expense pocket changes
-- =====================================================

-- Trigger function when donation pocket changes
CREATE OR REPLACE FUNCTION trigger_update_pocket_balance_on_donation_pocket_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old pocket if changed
  IF OLD.pocket_id != NEW.pocket_id THEN
    PERFORM update_pocket_balance(OLD.pocket_id);
  END IF;

  -- Update new pocket
  PERFORM update_pocket_balance(NEW.pocket_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for donation pocket changes
DROP TRIGGER IF EXISTS update_pocket_on_donation_pocket_change ON donations;
CREATE TRIGGER update_pocket_on_donation_pocket_change
  AFTER UPDATE OF pocket_id ON donations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_donation_pocket_change();

-- Trigger function when expense pocket changes
CREATE OR REPLACE FUNCTION trigger_update_pocket_balance_on_expense_pocket_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old pocket if changed
  IF OLD.pocket_id != NEW.pocket_id THEN
    PERFORM update_pocket_balance(OLD.pocket_id);
  END IF;

  -- Update new pocket
  PERFORM update_pocket_balance(NEW.pocket_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for expense pocket changes
DROP TRIGGER IF EXISTS update_pocket_on_expense_pocket_change ON expenses;
CREATE TRIGGER update_pocket_on_expense_pocket_change
  AFTER UPDATE OF pocket_id ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pocket_balance_on_expense_pocket_change();

-- =====================================================
-- INITIAL BALANCE CALCULATION
-- =====================================================

-- Recalculate all pocket balances to ensure consistency
DO $$
DECLARE
  pocket_record RECORD;
BEGIN
  FOR pocket_record IN SELECT id FROM pockets LOOP
    PERFORM update_pocket_balance(pocket_record.id);
  END LOOP;
END $$;

-- =====================================================
-- DONE! Pocket Balance Triggers Complete
-- =====================================================

-- Verification query
SELECT
  p.id,
  p.name,
  p.current_balance,
  (SELECT COALESCE(SUM(di.amount), 0)
   FROM donations d
   JOIN donation_items di ON di.donation_id = d.id
   WHERE d.pocket_id = p.id) AS total_donations,
  (SELECT COALESCE(SUM(ei.amount), 0)
   FROM expenses e
   JOIN expense_items ei ON ei.expense_id = e.id
   WHERE e.pocket_id = p.id AND e.status = 'approved') AS total_expenses,
  (SELECT COALESCE(SUM(di.amount), 0)
   FROM donations d
   JOIN donation_items di ON di.donation_id = d.id
   WHERE d.pocket_id = p.id) -
  (SELECT COALESCE(SUM(ei.amount), 0)
   FROM expenses e
   JOIN expense_items ei ON ei.expense_id = e.id
   WHERE e.pocket_id = p.id AND e.status = 'approved') AS calculated_balance
FROM pockets p;
