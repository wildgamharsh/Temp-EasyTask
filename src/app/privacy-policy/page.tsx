"use client";

import { LandingNavbar, LandingFooter } from "@/components/layout";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-slate-900 selection:bg-brand-200 selection:text-brand-900">
      <LandingNavbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-brand-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-slate-600 mb-8">
          Zaaro AI Corp.
        </p>
        
        <div className="prose prose-slate max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">2. Privacy Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Overview</h3>
                <p className="text-slate-700">This Privacy Policy describes how the Company collects, uses, discloses, and protects personal information when providing the Service. We aim to comply with applicable Canadian privacy laws, including the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws where they apply.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2 Roles: Company as Service Provider; Organizers as Controllers</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>In many cases, Organizers decide what personal information is collected from Customers and why. In those cases, Organizers are responsible for obtaining any necessary notices and consents from Customers and for responding to Customer privacy requests regarding Organizer-controlled data.</li>
                  <li>The Company acts as a service provider to Organizers for Organizer-controlled data and processes such data on the Organizer's behalf to provide the Service, subject to these Terms and the Organizer's instructions as available through product functionality.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.3 Personal Information We Collect</h3>
                <p className="text-slate-700 mb-3">Depending on how you use the Service, we may collect:</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Account and Profile Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Name, email address, phone number, business name, role, and account settings;</li>
                      <li>Authentication and security data (passwords are stored using hashing);</li>
                      <li>Support communications and preferences.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Bookings, Quotes, and Operations Data</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Customer contact details, booking or appointment details (date/time/location), notes, preferences, and communications;</li>
                      <li>Quote, invoice, and transaction-related records created within the Service.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Communications and Notifications</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Email and chat notification content and delivery metadata (timestamps, delivery status);</li>
                      <li>Unsubscribe and consent logs where available.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Promotions and Marketing Preferences</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Marketing preferences, consent records, and promotion interactions (such as open/click data where enabled).</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Issue Monitoring, Security, and Analytics</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Logs, error reports, device and browser details, IP address, and security/fraud signals;</li>
                      <li>Usage analytics such as feature usage, session activity, and performance metrics.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Payments and Billing</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Billing contact details, plan details, payment status, transaction IDs;</li>
                      <li>Payment data processed by third-party processors (e.g., Stripe). We do not store full card numbers.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">AI Features</h4>
                    <ul className="list-disc pl-6 space-y-1 text-slate-700">
                      <li>Inputs, prompts, and related context submitted to AI Features;</li>
                      <li>AI outputs generated in response to those inputs.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.4 How We Use Personal Information</h3>
                <p className="text-slate-700 mb-3">We use personal information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Create and manage accounts and authenticate users;</li>
                  <li>Provide core Service features (storefronts, bookings, quotes, notifications, and customer chat);</li>
                  <li>Send service/transactional messages (such as booking confirmations, invoices, and security alerts);</li>
                  <li>Send promotional messages only when permitted by law and consent;</li>
                  <li>Monitor reliability, troubleshoot, improve performance, and maintain security;</li>
                  <li>Provide customer support and respond to requests;</li>
                  <li>Meet legal and regulatory obligations;</li>
                  <li>Prevent fraud, abuse, and violations of these Terms.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.5 Legal Bases and Consent</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>We seek meaningful consent where required by Applicable Law. You can choose whether to receive promotional messages, and you can withdraw marketing consent at any time using unsubscribe links or account settings. Service and transactional messages may still be sent as necessary to provide the Service.</li>
                  <li>Organizers are responsible for obtaining required notices and consents from Customers for Organizer-controlled data, including consent to receive marketing messages and consent for photos/videos.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.6 How We Share Personal Information</h3>
                <p className="text-slate-700 mb-3">We may share personal information with:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Sub-processors and service providers that help us operate the Service (e.g., hosting, analytics, support tools, communications providers, payment processors, and AI model providers where applicable);</li>
                  <li>Organizers when you interact with an Organizer through the Service, so the Organizer can fulfill bookings, quotes, and service delivery;</li>
                  <li>Professional advisors (such as lawyers, auditors, and insurers) where necessary;</li>
                  <li>Authorities or other third parties where required by law or to protect rights, safety, and security.</li>
                </ul>
                <p className="text-slate-700 mt-3 font-semibold">We do not sell personal information.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.7 AI Model Providers (If Enabled)</h3>
                <p className="text-slate-700">If you use AI Features, certain inputs you submit may be processed by third-party AI model providers to generate outputs. We limit what we share to what is necessary to provide the feature and apply safeguards where feasible. AI model providers may retain and use such inputs in accordance with their terms and policies, and you should not submit confidential or sensitive information unless appropriate and lawful.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.8 International Transfers</h3>
                <p className="text-slate-700">Our service providers (including AI providers and hosting providers) may process or store information outside Canada. Where information is transferred, it may be subject to the laws of the jurisdiction where it is processed, and may be accessed by law enforcement or authorities in that jurisdiction.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.9 Security Safeguards</h3>
                <p className="text-slate-700">We use reasonable administrative, technical, and physical safeguards designed to protect personal information, including access controls and encryption in transit. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.10 Retention</h3>
                <p className="text-slate-700">We retain personal information only as long as necessary for the purposes described and as required by law. Our retention practices are described in the Data Retention Policy in Section 3.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.11 Access, Correction, and Requests</h3>
                <p className="text-slate-700">You may request access to and correction of your personal information, subject to legal limits. If you are a Customer of an Organizer, your requests regarding Organizer-controlled data should be directed to the Organizer in the first instance.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.12 Contact</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Email:</strong> info@zaaro.ai, contact@zaaro.ai</li>
                  <li><strong>Mail:</strong> Zaaro AI Corp., 5 Essex Drive, Steinbach, Manitoba, R5G 2V7, Canada</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
