import { SiteLayout } from "@/components/layout/SiteLayout";
import { SEO } from "@/components/saber/SEO";
import { PageHeader } from "@/components/saber/PageHeader";

const LAST_UPDATED = "May 4, 2026";
const SITE_URL = "https://www.manojmagar.info.np";
const CONTACT_EMAIL = "grindwithmt@gmail.com";

const Privacy = () => {
  return (
    <SiteLayout>
      <SEO
        title="Privacy Policy"
        description="Privacy policy for VNR610 Realm Codex — how your data is collected and used."
        path="/privacy"
      />
      <div className="container py-16 max-w-3xl">
        <PageHeader
          title="Privacy Policy"
          subtitle={`Last updated: ${LAST_UPDATED}`}
        />

        <div className="saber-card p-8 sm:p-10 space-y-8 prose-custom">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
            // privacy · policy
          </p>

          <Section title="1. Overview">
            <p>
              This Privacy Policy describes how VNR610 Realm Codex ("{SITE_URL}") collects,
              uses, and handles your information when you visit or interact with this site.
              By using this site, you agree to the practices described below.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p>We collect the following types of information:</p>
            <ul>
              <li>
                <strong>Contact form submissions</strong> — name, email address, and message
                content when you use the contact form.
              </li>
              <li>
                <strong>Newsletter subscriptions</strong> — email address when you subscribe
                to the newsletter.
              </li>
              <li>
                <strong>Guestbook entries</strong> — name and message when you sign the
                guestbook.
              </li>
              <li>
                <strong>Page view analytics</strong> — anonymised page paths and referrer
                URLs to understand site traffic. No personally identifiable information is
                stored in analytics.
              </li>
            </ul>
          </Section>

          <Section title="3. How we use your information">
            <p>Your information is used solely to:</p>
            <ul>
              <li>Respond to contact form messages</li>
              <li>Send newsletter updates you subscribed to</li>
              <li>Display approved guestbook entries publicly</li>
              <li>Understand how visitors use the site (aggregate analytics only)</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with third parties
              for marketing purposes.
            </p>
          </Section>

          <Section title="4. Data storage">
            <p>
              All data is stored securely in Supabase (PostgreSQL), hosted on servers
              in the Asia South region. Data is protected by row-level security policies
              and is only accessible to the site administrator.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              This site uses minimal cookies — only those required for authentication
              (admin login session). No tracking cookies or third-party advertising
              cookies are used.
            </p>
          </Section>

          <Section title="6. Third-party services">
            <p>This site uses the following third-party services:</p>
            <ul>
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>Groq / Llama</strong> — AI-assisted content generation (admin only)</li>
              <li><strong>GitHub, LeetCode, Hack The Box, HackerOne</strong> — public profile
                data fetched via their public APIs for the skills dashboard</li>
            </ul>
          </Section>

          <Section title="7. Your rights">
            <p>You have the right to:</p>
            <ul>
              <li>Request deletion of your data (contact form messages, newsletter subscription, guestbook entry)</li>
              <li>Unsubscribe from the newsletter at any time</li>
              <li>Request a copy of any data we hold about you</li>
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-saber-blue hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Changes to this policy">
            <p>
              This policy may be updated occasionally. The "Last updated" date at the top
              of this page reflects the most recent revision. Continued use of the site
              after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about this privacy policy? Email{" "}
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

export default Privacy;
