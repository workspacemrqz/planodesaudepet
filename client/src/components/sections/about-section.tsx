export default function AboutSection() {
  const stats = [
    { value: "50.000+", label: "Pets Protegidos" },
    { value: "200+", label: "Clínicas Credenciadas" },
    { value: "15+", label: "Estados Atendidos" },
    { value: "98%", label: "Satisfação" }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="backdrop-blur-sm p-8 rounded-2xl shadow-xl" style={{backgroundColor: '#FBF9F7'}}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="md:text-4xl font-bold mb-6 text-[#302e2b] text-[28px]">
                Sobre a <span className="text-[#277677]">UNIPET PLAN</span>
              </h2>
              <p className="text-[#302e2b] text-lg mb-6 leading-relaxed">
                Somos uma empresa brasileira especializada em planos de saúde para pets, 
                comprometida em oferecer o melhor cuidado veterinário com preços acessíveis 
                e atendimento humanizado.
              </p>
              <p className="text-[#302e2b] text-lg mb-8 leading-relaxed">
                Nossa missão é garantir que todos os pets tenham acesso a cuidados de saúde 
                de qualidade, proporcionando tranquilidade às famílias brasileiras que amam 
                seus animais de estimação.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-[#277677] mb-2">{stat.value}</div>
                    <div className="text-[#302e2b]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Pet insurance concept image */}
              <img 
                src="/inicio-sobre.jpg" 
                alt="Conceito de seguro pet com veterinário cuidando de animal" 
                className="rounded-2xl shadow-xl w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
