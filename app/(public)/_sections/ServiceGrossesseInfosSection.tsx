import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceGrossesseInfosSection() {
  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="04" />
        <SectionHeading kicker="PRATIQUE" title="Ce qu'il faut savoir." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <InfoCard
            icon={<ClockIcon />}
            title="Dur&eacute;e"
            text="Chaque s&eacute;ance dure 60 minutes."
          />
          <InfoCard
            icon={<DollarIcon />}
            title="Tarifs"
            text="90 $ la s&eacute;ance d'une heure."
          />
          <InfoCard
            icon={<ReceiptIcon />}
            title="Assurances"
            text="La plupart des assurances priv&eacute;es couvrent l'acupuncture. Re&ccedil;u officiel &eacute;mis."
          />
        </div>

        {/* Note continuite */}
        <div className="mt-12 max-w-[780px] mx-auto p-6 bg-white rounded-[14px] border-l-4 border-public-accent-taupe">
          <p className="text-[15px] leading-relaxed text-public-text-medium">
            <strong className="text-public-text-dark">Un avantage unique</strong> &mdash; je peux vous
            accompagner du d&eacute;but &agrave; la fin : fertilit&eacute; &rarr; grossesse &rarr;
            accouchement &rarr; post-partum &rarr; b&eacute;b&eacute;. Cette continuit&eacute; est pr&eacute;cieuse.
          </p>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">
        {title}
      </h3>
      <p className="text-[14px] text-public-text-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
}

function DollarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.21 0-4-1.5-4-3.5S9.79 5 12 5c1.146 0 2.18.4 2.913 1.04m-5.913 8.96c.348.262.778.477 1.252.624.474.146.988.226 1.516.226.528 0 1.042-.08 1.516-.226.474-.147.904-.362 1.252-.624" /></svg>;
}

function ReceiptIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" /></svg>;
}
