import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Scale, Mail, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[88vh] bg-[#111317] border border-white/10 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/8 flex items-start justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Scale size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                      Legal Policy
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Last Updated: October 2026
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    Terms of Service & Intermediary Disclaimer
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Website: <span className="text-white font-medium">www.motohippi.com</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-white/80 leading-relaxed custom-scrollbar">
              {/* Important Callout */}
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3 text-primary">
                <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs text-white/90">
                  <p className="font-bold text-primary mb-1">Intermediary Status</p>
                  <p>
                    motohippi.com operates strictly as an online technology aggregator and intermediary under Section 79 of the Information Technology Act, 2000. Peer-to-peer rides, meetups, and agreements are organized independently by users.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">1</span>
                  Nature of Service & Intermediary Status
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
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
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">2</span>
                  Independent Party Connections & No Company Involvement
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
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
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">3</span>
                  Exclusion of Liability & Bharatiya Nyaya Sanhita (BNS) Compliance
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
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
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">4</span>
                  User Representations & Warranties
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
                  <p>By accessing motohippi.com, you expressly represent, warrant, and agree that:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-white/70">
                    <li>You are at least 18 years of age and legally competent to enter into binding agreements;</li>
                    <li>You participate in any ride, event, or social connection discovered through the Platform entirely at your own risk; and</li>
                    <li>You will not hold the Company or motohippi.com responsible for any losses, injury, damages, or disputes resulting from peer-to-peer interactions.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">5</span>
                  Indemnification
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
                  <p>
                    You agree to defend, indemnify, and hold harmless the Company, motohippi.com, its directors, employees, and affiliates from and against any claims, liabilities, damages, losses, penalties, court actions, or legal fees arising from:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-white/70">
                    <li>Your violation of these Terms;</li>
                    <li>Your conduct during offline rides, events, or interactions with other Users; or</li>
                    <li>Any breach of applicable statutory laws, including traffic and motor vehicle regulations.</li>
                  </ol>
                </div>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">6</span>
                  Grievance Officer & Take-Down Policy
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
                  <p>
                    In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, if any user or authority identifies unlawful content or copyright infringement on motohippi.com, they may report it to our Grievance Officer:
                  </p>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 mt-2">
                    <p className="font-bold text-white">Attn: Grievance Officer – motohippi.com</p>
                    <p className="flex items-center gap-1.5 text-primary">
                      <Mail size={13} />
                      <a href="mailto:legal@motohippi.com" className="hover:underline">
                        legal@motohippi.com
                      </a>
                    </p>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      <strong>Response Timeline:</strong> Acknowledged within 24 hours and resolved within statutory timelines upon receipt of a valid notice or court order.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-primary font-black">7</span>
                  Governing Law & Jurisdiction
                </h3>
                <div className="pl-8 space-y-2 text-xs text-white/75">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal proceedings or disputes arising out of or in connection with motohippi.com shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">New Delhi, India</strong>.
                  </p>
                </div>
              </section>

              {/* Footer text */}
              <div className="pt-4 border-t border-white/8 text-center text-xs text-muted-foreground">
                <p>© 2026 motohippi.com. All rights reserved.</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Confidential – For Website & Mobile Application Use</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-white/8 bg-white/[0.02] flex items-center justify-between gap-3">
              <Link href="/terms" onClick={onClose} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors">
                <ExternalLink size={13} />
                Open Full Web Page
              </Link>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
