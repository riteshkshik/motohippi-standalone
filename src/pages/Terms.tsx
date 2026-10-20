import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';
import { ShieldCheck, Mail, Scale } from 'lucide-react';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service & Intermediary Disclaimer"
      subtitle="Last Updated: October 2026 · Website: www.motohippi.com"
    >
      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        {/* Callout Banner */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3 text-primary">
          <ShieldCheck size={22} className="shrink-0 mt-0.5" />
          <div className="text-xs text-white/90">
            <p className="font-bold text-primary mb-1">Intermediary Status & Regulatory Disclaimer</p>
            <p>
              Under Section 2(1)(w) and Section 79 of the Information Technology Act, 2000 (read with the Information Technology Rules, 2021), motohippi.com operates strictly as an Intermediary. Peer-to-peer rides, meetups, and agreements are organized independently by users.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Operated by: The Company (hereinafter referred to as &ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;)
        </p>

        {/* Section 1 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">1</span>
            Nature of Service & Intermediary Status
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>
              <strong className="text-white">1.1.</strong> motohippi.com is a digital platform and technology aggregator. The Website and Mobile Application function solely as an online technology facilitator that enables registered users, motorcycle enthusiasts, content creators, and independent service providers (&ldquo;Users&rdquo;) to connect, share content, and discover events or routes.
            </p>
            <p>
              <strong className="text-white">1.2.</strong> Under Section 2(1)(w) and Section 79 of the Information Technology Act, 2000 (read with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021), motohippi.com operates strictly as an Intermediary.
            </p>
            <p>
              <strong className="text-white">1.3.</strong> The Company does not initiate, control, modify, monitor, or approve individual user communications, offline meetups, group rides, peer-to-peer agreements, or any transactions conducted between Users.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">2</span>
            Independent Party Connections & No Company Involvement
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>
              <strong className="text-white">2.1.</strong> Any interaction, agreement, offline ride, event participation, meeting, transaction, or relationship established through motohippi.com is strictly and exclusively between the respective Users.
            </p>
            <p>
              <strong className="text-white">2.2.</strong> The Company is not a party to, nor an agent, broker, organiser, partner, or guarantor of any transaction or physical gathering arranged by Users.
            </p>
            <p>
              <strong className="text-white">2.3.</strong> Users acknowledge and agree that motohippi.com provides no endorsement, verification, background checks, or safety guarantees regarding any User, route, event, or third-party service displayed on the Platform.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">3</span>
            Exclusion of Liability & Bharatiya Nyaya Sanhita (BNS) Compliance
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>
              <strong className="text-white">3.1. Criminal & Tortious Immunity:</strong> In accordance with the provisions of the Bharatiya Nyaya Sanhita, 2023 (BNS) (which replaces the Indian Penal Code, 1860), the Company, its directors, officers, and employees possess no criminal intent (mens rea) or active role (actus reus) in User conduct.
            </p>
            <p>
              <strong className="text-white">3.2.</strong> Under no circumstances shall the Company be held liable under Section 45 (Abetment), Section 61 (Criminal Conspiracy), Section 106 (Negligence), or any related provisions of the BNS, 2023 for any unlawful act, accident, physical injury, property damage, traffic violation, or dispute arising between Users during independent rides or social interactions.
            </p>
            <p>
              <strong className="text-white">3.3. Motor Vehicle & Safety Compliance:</strong> Users assume full individual responsibility for compliance with the Motor Vehicles Act, including maintaining valid driving licences, insurance coverage, helmet laws, and vehicle safety standards during any ride or event.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">4</span>
            User Representations & Warranties
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>By accessing motohippi.com, you expressly represent, warrant, and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/70">
              <li>You are at least 18 years of age and legally competent to enter into binding agreements;</li>
              <li>You participate in any ride, event, or social connection discovered through the Platform entirely at your own risk; and</li>
              <li>You will not hold the Company or motohippi.com responsible for any losses, injury, damages, or disputes resulting from peer-to-peer interactions.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">5</span>
            Indemnification
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>
              You agree to defend, indemnify, and hold harmless the Company, motohippi.com, its directors, employees, and affiliates from and against any claims, liabilities, damages, losses, penalties, court actions, or legal fees arising from:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-white/70">
              <li>Your violation of these Terms;</li>
              <li>Your conduct during offline rides, events, or interactions with other Users; or</li>
              <li>Any breach of applicable statutory laws, including traffic and motor vehicle regulations.</li>
            </ol>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">6</span>
            Grievance Officer & Take-Down Policy
          </h2>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-white/75">
            <p>
              In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, if any user or authority identifies unlawful content or copyright infringement on motohippi.com, they may report it to our Grievance Officer:
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 mt-2">
              <p className="font-bold text-white text-sm">Attn: Grievance Officer – motohippi.com</p>
              <p className="flex items-center gap-2 text-primary font-semibold">
                <Mail size={15} />
                <a href="mailto:legal@motohippi.com" className="hover:underline">
                  legal@motohippi.com
                </a>
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                <strong>Response Timeline:</strong> Acknowledged within 24 hours and resolved within statutory timelines upon receipt of a valid notice or court order.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-2.5 pt-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-black">7</span>
            Governing Law & Jurisdiction
          </h2>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-white/75">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal proceedings or disputes arising out of or in connection with motohippi.com shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">New Delhi, India</strong>.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-white/8 text-center text-xs text-muted-foreground">
          <p>© 2026 motohippi.com. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Confidential – For Website & Mobile Application Use</p>
        </div>
      </div>
    </LegalLayout>
  );
}
