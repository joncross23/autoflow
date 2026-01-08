-- ============================================
-- RICE Score Auto-Calculation Trigger
-- Automatically calculates rice_score when RICE components are updated
-- ============================================

-- Function to calculate RICE score
-- RICE = (Reach × Impact × Confidence%) / Effort
CREATE OR REPLACE FUNCTION calculate_rice_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if all components are present
  IF NEW.rice_reach IS NOT NULL
     AND NEW.rice_impact IS NOT NULL
     AND NEW.rice_confidence IS NOT NULL
     AND NEW.rice_effort IS NOT NULL
     AND NEW.rice_effort > 0 THEN

    -- Calculate: (Reach × Impact × Confidence%) / Effort
    -- Round to 2 decimal places
    NEW.rice_score := ROUND(
      (NEW.rice_reach * NEW.rice_impact * (NEW.rice_confidence / 100.0)) / NEW.rice_effort,
      2
    );
  ELSE
    -- Clear score if any component is missing
    NEW.rice_score := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on ideas table
DROP TRIGGER IF EXISTS trigger_calculate_rice_score ON ideas;

CREATE TRIGGER trigger_calculate_rice_score
  BEFORE INSERT OR UPDATE OF rice_reach, rice_impact, rice_confidence, rice_effort
  ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION calculate_rice_score();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION calculate_rice_score() IS
  'Automatically calculates RICE score when RICE components are updated. Formula: (Reach × Impact × Confidence%) / Effort';

COMMENT ON TRIGGER trigger_calculate_rice_score ON ideas IS
  'Automatically recalculates rice_score whenever RICE components change';
