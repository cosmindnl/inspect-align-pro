-- ================================================
-- FAZA 1: Enum Types și Tabele Core
-- ================================================

-- Enum pentru roluri utilizatori
CREATE TYPE public.app_role AS ENUM ('admin', 'engineer', 'viewer');

-- Enum pentru tipuri rapoarte
CREATE TYPE public.report_type AS ENUM ('ground', 'electrical', 'solar');

-- Enum pentru status rapoarte
CREATE TYPE public.report_status AS ENUM ('draft', 'validated', 'signed', 'archived');

-- Enum pentru conformitate
CREATE TYPE public.conformity_status AS ENUM ('conformant', 'nonconformant');

-- Enum pentru tipuri instalații
CREATE TYPE public.installation_type AS ENUM ('industrial', 'residential', 'commercial', 'photovoltaic');

-- Enum pentru tip client
CREATE TYPE public.client_type AS ENUM ('company', 'individual');

-- ================================================
-- Tabela Profiles (legată la auth.users)
-- ================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela User Roles (securitate separată)
-- ================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Funcție Security Definer pentru verificare roluri
-- ================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ================================================
-- Tabela Companies (ANRE ready)
-- ================================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cui TEXT,
  registration_number TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  is_anre_certified BOOLEAN DEFAULT FALSE,
  anre_certificate_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Adăugare foreign key pentru profiles.company_id
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- ================================================
-- Tabela Engineers (ingineri verificatori)
-- ================================================
CREATE TABLE public.engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  anre_certificate_number TEXT,
  anre_certificate_type TEXT,
  certificate_expiry_date DATE,
  specializations JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Clients (clienți)
-- ================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  client_type public.client_type DEFAULT 'company',
  cui TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Sites (locații/puncte de lucru)
-- ================================================
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  county TEXT,
  coordinates POINT,
  installation_type public.installation_type DEFAULT 'residential',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Reports (rapoarte de verificare)
-- ================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES public.engineers(id) ON DELETE SET NULL,
  report_type public.report_type NOT NULL,
  status public.report_status DEFAULT 'draft',
  conformity public.conformity_status,
  inspection_date DATE DEFAULT CURRENT_DATE,
  weather_conditions TEXT,
  ambient_temperature NUMERIC,
  observations TEXT,
  recommendations TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Measurements (măsurători)
-- ================================================
CREATE TABLE public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  measurement_type TEXT NOT NULL,
  measurement_method TEXT,
  value NUMERIC,
  unit TEXT,
  limit_value NUMERIC,
  is_conformant BOOLEAN,
  location_description TEXT,
  equipment_used TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Report Files (fișiere atașate)
-- ================================================
CREATE TABLE public.report_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.report_files ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Tabela Audit Logs (jurnal activități)
-- ================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Trigger pentru creare automată profil la signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Funcție pentru actualizare automată updated_at
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers pentru updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engineers_updated_at
  BEFORE UPDATE ON public.engineers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- Funcție pentru generare număr raport
-- ================================================
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(report_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.reports
  WHERE report_number LIKE 'BV-' || year_part || '-%';
  
  NEW.report_number := 'BV-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_report_number_trigger
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  WHEN (NEW.report_number IS NULL)
  EXECUTE FUNCTION public.generate_report_number();

-- ================================================
-- RLS Policies
-- ================================================

-- Profiles: utilizatorii își pot vedea și edita propriul profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User Roles: doar admini pot gestiona roluri
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Companies: utilizatorii pot vedea compania lor
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage companies"
  ON public.companies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Engineers: vizibil pentru membrii aceleiași companii
CREATE POLICY "Company members can view engineers"
  ON public.engineers FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage engineers"
  ON public.engineers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Clients: vizibil pentru membrii aceleiași companii
CREATE POLICY "Company members can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Engineers can manage clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'engineer') 
    AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Sites: vizibil pentru membrii companiei clientului
CREATE POLICY "Company members can view sites"
  ON public.sites FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Engineers can manage sites"
  ON public.sites FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'engineer')
    AND client_id IN (
      SELECT id FROM public.clients 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Reports: vizibil pentru membrii companiei
CREATE POLICY "Company members can view reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.clients c ON s.client_id = c.id
      WHERE c.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Engineers can manage own reports"
  ON public.reports FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'engineer')
    AND engineer_id IN (SELECT id FROM public.engineers WHERE profile_id = auth.uid())
  );

-- Measurements: acces bazat pe raport
CREATE POLICY "Access measurements through reports"
  ON public.measurements FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT r.id FROM public.reports r
      JOIN public.sites s ON r.site_id = s.id
      JOIN public.clients c ON s.client_id = c.id
      WHERE c.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Engineers can manage measurements"
  ON public.measurements FOR ALL
  TO authenticated
  USING (
    report_id IN (
      SELECT r.id FROM public.reports r
      WHERE r.engineer_id IN (SELECT id FROM public.engineers WHERE profile_id = auth.uid())
    )
  );

-- Report Files: acces bazat pe raport
CREATE POLICY "Access files through reports"
  ON public.report_files FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT r.id FROM public.reports r
      JOIN public.sites s ON r.site_id = s.id
      JOIN public.clients c ON s.client_id = c.id
      WHERE c.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Engineers can manage files"
  ON public.report_files FOR ALL
  TO authenticated
  USING (
    report_id IN (
      SELECT r.id FROM public.reports r
      WHERE r.engineer_id IN (SELECT id FROM public.engineers WHERE profile_id = auth.uid())
    )
  );

-- Audit Logs: doar admini pot vedea
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ================================================
-- Indexes pentru performanță
-- ================================================
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_engineers_company_id ON public.engineers(company_id);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_sites_client_id ON public.sites(client_id);
CREATE INDEX idx_reports_site_id ON public.reports(site_id);
CREATE INDEX idx_reports_engineer_id ON public.reports(engineer_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_report_type ON public.reports(report_type);
CREATE INDEX idx_reports_report_number ON public.reports(report_number);
CREATE INDEX idx_measurements_report_id ON public.measurements(report_id);
CREATE INDEX idx_report_files_report_id ON public.report_files(report_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);