-- Create saved financing reports table
CREATE TABLE public.saved_financing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  property_price NUMERIC NOT NULL,
  down_payment NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  tenure INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  total_interest NUMERIC NOT NULL,
  salary NUMERIC NOT NULL,
  other_income NUMERIC DEFAULT 0,
  total_obligations NUMERIC DEFAULT 0,
  dti NUMERIC NOT NULL,
  remaining_income NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  sector TEXT NOT NULL,
  is_eligible BOOLEAN NOT NULL,
  eligible_banks_count INTEGER DEFAULT 0,
  has_personal_loan BOOLEAN DEFAULT false,
  personal_loan_amount NUMERIC DEFAULT 0,
  has_car_loan BOOLEAN DEFAULT false,
  car_loan_installment NUMERIC DEFAULT 0,
  has_credit_card BOOLEAN DEFAULT false,
  credit_card_limit NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_financing_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own reports"
ON public.saved_financing_reports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
ON public.saved_financing_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
ON public.saved_financing_reports
FOR DELETE
USING (auth.uid() = user_id);

-- Create property comparison table
CREATE TABLE public.property_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_comparisons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own comparisons"
ON public.property_comparisons
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own comparisons"
ON public.property_comparisons
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comparisons"
ON public.property_comparisons
FOR DELETE
USING (auth.uid() = user_id);