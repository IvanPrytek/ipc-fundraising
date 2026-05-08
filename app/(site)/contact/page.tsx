import FadeIn from "@/components/ui/FadeIn";
import ContactForm from "@/components/forms/ContactForm";
import PageBackground from "@/components/ui/PageBackground";

export default function ContactPage() {
  return (
    <PageBackground glow="bottom-center">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <h1 className="text-section text-white">Get in touch</h1>
            <p className="mt-6 text-body leading-relaxed text-white/55">
              Every conversation starts with listening. Tell us about your
              situation and we&apos;ll respond within one business day.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-14">
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </section>
    </PageBackground>
  );
}
