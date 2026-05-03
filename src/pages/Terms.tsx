import { SiteLayout } from "@/components/layout/SiteLayout";
import { SEO } from "@/components/saber/SEO";
import { PageHeader } from "@/components/saber/PageHeader";

const LAST_UPDATED = "May 4, 2026";
const SITE_URL = "https://www.manojmagar.info.np";
const CONTACT_EMAIL = "grindwithmt@gmail.com";

const Terms = () => {
  return (
    <SiteLayout>
      <SEO
        title="Terms of Service"
        description="Terms of service for VNR610 Realm Codex."
        path="/terms"
      />
      <div className="container py-16 max-w-3xl">
        <PageHeader
          title="Terms of Service"
          subtitle={`Last updated: ${LAST_UPDATED}`}
        />

        <div className="saber-card p-8 sm:p-10 space-y-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
            // terms · of · service
          </p>

          <Section title="1. Acceptance of terms">
            <p>
              By accessing or using VNR610 Realm Codex ("{SITE_URL}"), you agree to be
              bound by these Terms of Service. If you do not agree, please do not use
              this site.
            </p>
          </Section>

          <Section title="2. Use of the site">
            <p>This site is a personal portfolio and blog. You may:</p>
            <ul>
              <li>Browse all public content freely</li>
              <li>Share links to content on this site</li>
              <li>Submit contact messages and guestbook entries in good faith</li>
              <li>Subscribe to the newsletter</li>
            </ul>
            <p>You may not:</p>
            <ul>
              <li>Scrape, copy, or reproduce content without attribution</li>
              <li>Submit spam, abusive, or illegal content via any form</li>
              <li>Attempt to access admin areas without authorisation</li>
              <li>Use automated tools to overload or disrupt the site</li>
            </ul>
          </Section>

          <Section title="3. Intellectual property">
            <p>
              All content on this site — including writeups, code snippets, project
              descriptions, and design — is the intellectual property of VNR610 unless
              otherwise stated. You may reference or quote content with proper attribution
              and a link back to the original page.
            </p>
          </Section>

          <Section title="4. User-submitted content">
            <p>
              By submitting a guestbook entry or contact message, you grant permission
              to display that content on this site (guestbook entries, after moderation).
              You are responsible for ensuring your submissions do not violate any laws
              or third-party rights.
            </p>
          </Section>

          <Section title="5. Disclaimer of warranties">
            <p>
              This site is provided "as is" without warranties of any kind. Content is
              for informational and educational purposes only. Technical writeups and
              security content are shared for learning — use responsibly and only on
              systems you own or have explicit permission to test.
            </p>
          </Section>

          <Section title="6. Limitation of liability">
            <p>
              VNR610 is not liable for any damages arising from your use of this site,
              reliance on its content, or inability to access the site. This includes
              direct, indirect, incidental, or consequential damages.
            </p>
          </Section>

          <Section title="7. External links">
            <p>
              This site may link to external websites. We are not responsible for the
              content, privacy practices, or availability of those sites.
            </p>
          </Section>

          <Section title="8. Changes to terms">
            <p>
              These terms may be updated at any time. The "Last updated" date reflects
              the most recent revision. Continued use of the site constitutes acceptance
              of any changes.
            </p>
          </Section>

          <Section title="9. Governing law">
            <p>
              These terms are governed by the laws of Nepal. Any disputes shall be
              resolved under Nepali jurisdiction.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about these terms? Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-saber-blue hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </SiteLayout>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-foreground/80 [&_a]:text-saber-blue [&_a:hover]:underline">
        {children}
      </div>
    </div>
  );
}

export default Terms;
