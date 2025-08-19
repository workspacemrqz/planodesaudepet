import FaqSection from "@/components/sections/faq-section";

export default function FAQ() {
  return (
    <main className="pt-32 pb-20 bg-[#277677] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
      </div>
      
      {/* FAQ Section */}
      <FaqSection 
        showTitle={true} 
        className="pt-0" 
        customColors={{
          backgroundColor: '#277677',
          titleColor: '#FBF9F7',
          subtitleColor: '#FBF9F7'
        }}
      />
    </main>
  );
}