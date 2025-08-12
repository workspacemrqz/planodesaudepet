export default function AboutSection() {
  const stats = [
    { value: "50.000+", label: "Pets Protegidos" },
    { value: "200+", label: "Clínicas Credenciadas" },
    { value: "15+", label: "Estados Atendidos" },
    { value: "98%", label: "Satisfação" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#060606]">
              Sobre a <span className="text-primary">UNIPET PLAN</span>
            </h2>
            <p className="text-[#101010] text-lg mb-6 leading-relaxed">
              Somos uma empresa brasileira especializada em planos de saúde para pets, 
              comprometida em oferecer o melhor cuidado veterinário com preços acessíveis 
              e atendimento humanizado.
            </p>
            <p className="text-[#101010] text-lg mb-8 leading-relaxed">
              Nossa missão é garantir que todos os pets tenham acesso a cuidados de saúde 
              de qualidade, proporcionando tranquilidade às famílias brasileiras que amam 
              seus animais de estimação.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-[#101010]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Pet insurance concept image */}
            <img 
              src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Conceito de seguro pet com veterinário cuidando de animal" 
              className="rounded-2xl shadow-xl w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
