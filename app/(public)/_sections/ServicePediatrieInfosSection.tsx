import Link from 'next/link';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServicePediatrieInfosSection() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="04" />
        <SectionHeading kicker="PRATIQUE" title="Ce qu'il faut savoir." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <InfoCard
            icon={<ClockIcon />}
            title="Dur&eacute;e"
            text="20-30 min pour b&eacute;b&eacute;s, 30-45 min pour enfants."
          />
          <InfoCard
            icon={<DollarIcon />}
            title="Tarifs"
            text="90 $ la s&eacute;ance."
          />
          <InfoCard
            icon={<ShieldIcon />}
            title="S&eacute;curit&eacute;"
            text="Aiguilles st&eacute;riles &agrave; usage unique, formation en s&eacute;curit&eacute; p&eacute;diatrique, parent toujours pr&eacute;sent en salle."
          />
        </div>

        <p className="mt-12 text-center text-[15px] text-public-text-medium max-w-[720px] mx-auto">
          Pour les familles avec des contraintes financi&egrave;res,{' '}
          <Link
            href="/services/acupuncture-sociale"
            className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
          >
            l&rsquo;acupuncture sociale est aussi accessible
          </Link>
          .
        </p>
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

function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
}
