import TestimonialCard from '../_components/TestimonialCard';

export default function ServiceGrossesseTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <TestimonialCard
          featured
          quote={
            "J'ai consulté Judith pendant ma grossesse, et cela a fait une énorme différence pour moi. " +
            "Elle m'a beaucoup aidée à diminuer les douleurs au dos et aux hanches. Dès le début, " +
            "elle a su m'écouter avec attention, me rassurer et me donner de précieux conseils pour mieux vivre " +
            "ma grossesse. À l'approche de l'accouchement, je la vois plus régulièrement : chaque séance " +
            "est profondément apaisante. Judith transmet avec beaucoup de douceur et de passion son amour pour tout " +
            "ce qui entoure la grossesse et la naissance. Elle partage des conseils très concrets — par exemple, " +
            "les points de pression à utiliser le jour J ! Je la recommande sans hésitation : une écoute " +
            "exceptionnelle, une grande bienveillance et un professionnalisme. Une praticienne précieuse que je suis " +
            "heureuse d'avoir rencontrée."
          }
          name="Ingrid M."
          detail="Avis Google sur la clinique La Source en Soi"
        />
      </div>
    </section>
  );
}
