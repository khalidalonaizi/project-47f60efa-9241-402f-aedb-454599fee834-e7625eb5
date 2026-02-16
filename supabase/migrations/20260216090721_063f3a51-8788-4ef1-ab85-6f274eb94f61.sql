
-- Step 1: Restrict profiles SELECT to own profile only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Step 2: Create validation function for account types
CREATE OR REPLACE FUNCTION public.validate_account_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'financing_requests' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.provider_id 
      AND account_type = 'financing_provider'
    ) THEN
      RAISE EXCEPTION 'provider_id must be a financing_provider';
    END IF;
  ELSIF TG_TABLE_NAME = 'property_management_requests' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.office_id 
      AND account_type = 'real_estate_office'
    ) THEN
      RAISE EXCEPTION 'office_id must be a real_estate_office';
    END IF;
  ELSIF TG_TABLE_NAME = 'appraisal_requests' THEN
    IF NEW.appraiser_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.appraiser_id 
      AND account_type = 'appraiser'
    ) THEN
      RAISE EXCEPTION 'appraiser_id must be an appraiser';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Create triggers
CREATE TRIGGER validate_financing_provider
  BEFORE INSERT OR UPDATE ON financing_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_account_type();

CREATE TRIGGER validate_office
  BEFORE INSERT OR UPDATE ON property_management_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_account_type();

CREATE TRIGGER validate_appraiser
  BEFORE INSERT OR UPDATE ON appraisal_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_account_type();
