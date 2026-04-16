import TestimonialCard from '../_components/TestimonialCard';

export default function ServiceGrossesseTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <TestimonialCard
          featured
          quote={
            "J'ai consult\u00e9 Judith pendant ma grossesse, et cela a fait une \u00e9norme diff\u00e9rence pour moi. " +
            "Elle m'a beaucoup aid\u00e9e \u00e0 diminuer les douleurs au dos et aux hanches. D\u00e8s le d\u00e9but, " +
            "elle a su m'\u00e9couter avec attention, me rassurer et me donner de pr\u00e9cieux conseils pour mieux vivre " +
            "ma grossesse. \u00c0 l'approche de l'accouchement, je la vois plus r\u00e9guli\u00e8rement : chaque s\u00e9ance " +
            "est profond\u00e9ment apaisante. Judith transmet avec beaucoup de douceur et de passion son amour pour tout " +
            "ce qui entoure la grossesse et la naissance. Elle partage des conseils tr\u00e8s concrets \u2014 par exemple, " +
            "les points de pression \u00e0 utiliser le jour J ! Je la recommande sans h\u00e9sitation : une \u00e9coute " +
            "exceptionnelle, une grande bienveillance et un professionnalisme. Une praticienne pr\u00e9cieuse que je suis " +
            "heureuse d'avoir rencontr\u00e9e."
          }
          name="Ingrid M."
          detail="Avis Google sur la clinique La Source en Soi"
        />
      </div>
    </section>
  );
}
