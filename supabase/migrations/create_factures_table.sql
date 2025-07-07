-- Create factures table
CREATE TABLE factures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    numero VARCHAR NOT NULL UNIQUE,
    devis_id UUID REFERENCES devis(id) ON DELETE SET NULL,
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE NOT NULL,
    statut VARCHAR NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'annulee')),
    montant_ht DECIMAL(10,2) NOT NULL,
    tva DECIMAL(5,2) NOT NULL,
    montant_ttc DECIMAL(10,2) NOT NULL,
    conditions_paiement TEXT,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for factures
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own factures"
    ON factures FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own factures"
    ON factures FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own factures"
    ON factures FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own factures"
    ON factures FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_factures_updated_at
    BEFORE UPDATE ON factures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 