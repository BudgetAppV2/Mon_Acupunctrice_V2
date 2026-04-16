import TestimonialCard from '../_components/TestimonialCard';

export default function ServiceFertiliteTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <TestimonialCard
          quote='Juste un petit mot pour te dire que j&rsquo;ai eu un beau "positif". Je suis enceinte. Le dernier traitement que tu m&rsquo;as fait m&rsquo;a beaucoup aid&eacute;e, car le stress n&rsquo;est pas revenu apr&egrave;s.'
          name="Cliente, 41 ans"
          detail="T&eacute;moignage partag&eacute; avec son accord"
        />
      </div>
    </section>
  );
}
