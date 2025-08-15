CREATE TABLE "site_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"whatsapp" text,
	"email" text,
	"phone" text,
	"instagram_url" text,
	"facebook_url" text,
	"linkedin_url" text,
	"youtube_url" text,
	"cnpj" text,
	"business_hours" text,
	"our_story" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default settings row
INSERT INTO "site_settings" (
	id,
	whatsapp,
	email,
	phone,
	instagram_url,
	facebook_url,
	linkedin_url,
	youtube_url,
	cnpj,
	business_hours,
	our_story
) VALUES (
	gen_random_uuid(),
	'(11) 99999-9999',
	'contato@unipetplan.com.br',
	'0800 123 4567',
	'',
	'',
	'',
	'',
	'00.000.000/0001-00',
	'Segunda a Sexta: 8h às 18h, Sábado: 8h às 14h, Emergências: 24h todos os dias',
	'A UNIPET PLAN nasceu da paixão de veterinários experientes que identificaram a necessidade de tornar os cuidados veterinários mais acessíveis para todas as famílias brasileiras. Fundada com o objetivo de democratizar o acesso à saúde animal, nossa empresa oferece planos de saúde especializados que garantem que seu pet receba os melhores cuidados sem comprometer o orçamento familiar. Acreditamos que todo animal merece amor, cuidado e atenção veterinária de qualidade, independentemente da condição financeira de seus tutores.'
);