"use client";

import { LandingNavbar, LandingFooter } from "@/components/layout";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-slate-900 selection:bg-brand-200 selection:text-brand-900">
      <LandingNavbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-brand-900 mb-4">Terms and Conditions</h1>
        <p className="text-lg text-slate-600 mb-8">
          Zaaro AI Corp.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Including: Terms of Service, Privacy Policy, Data Retention Policy, Billing Compliance Policy, and Email Compliance (CASL) Policy
        </p>
        
        <div className="prose prose-slate max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Terms of Service</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.1 Definitions</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Company</strong>, <strong>Zaaro</strong>, <strong>we</strong>, <strong>us</strong>, <strong>our</strong> means Zaaro AI Corp.</li>
                  <li><strong>Service</strong> means the Zaaro software-as-a-service platform, websites, applications, APIs, and related services, features, and documentation.</li>
                  <li><strong>Organizer</strong> means an individual, sole proprietor, or business entity that subscribes to and uses the Service to market, sell, schedule, book, deliver, or manage products or services to its customers.</li>
                  <li><strong>Customer</strong> means an end user (consumer or business) who interacts with an Organizer via the Service (including via an Organizer storefront) to request, purchase, book, pay for, or receive products or services from the Organizer.</li>
                  <li><strong>Content</strong> means any text, images, video, audio, files, data, prompts, messages, templates, customer records, listings, pricing, branding, and other materials submitted to, stored in, processed by, or transmitted through the Service by or on behalf of a user.</li>
                  <li><strong>AI Features</strong> means any AI-assisted functionality offered as part of the Service, including drafting, suggestions, automation, classification, summarization, or analytics outputs.</li>
                  <li><strong>Order Form</strong> means any checkout page, plan description, subscription screen, or other document referencing pricing, plan limits, or the commercial terms for the Service.</li>
                  <li><strong>Applicable Law</strong> means all laws, regulations, rules, and guidance that apply to a party or to the use of the Service, including privacy, anti-spam, consumer protection, tax, advertising, and intellectual property laws.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.2 Acceptance of Terms</h3>
                <p className="text-slate-700 mb-3">These Terms of Service (the <strong>Terms</strong>) form a binding legal agreement between you and the Company. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not access or use the Service.</p>
                <p className="text-slate-700">If you use the Service on behalf of an Organizer (such as an employer or business), you represent and warrant that you have the authority to bind that Organizer, and you includes both you and that Organizer.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.3 The Service and Role of the Company</h3>
                <p className="text-slate-700 mb-3">The Company provides a technology platform that enables Organizers to create shopfronts and operational workflows such as bookings, quotes, notifications, promotions, customer chat, payment-related integrations, issue monitoring, and usage analytics. The Company is not a party to any contract, transaction, or relationship between an Organizer and a Customer.</p>
                <p className="text-slate-700">Organizers, not the Company, are solely responsible for: (a) their products and services; (b) pricing, refunds, chargebacks, cancellations, rescheduling, and disputes; (c) the accuracy of listings and advertising; (d) compliance with Applicable Law; and (e) all interactions and obligations to Customers.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.4 Eligibility, Accounts, and Security</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>You must be at least the age of majority in your place of residence and capable of forming a binding contract.</li>
                  <li>You must provide accurate, complete, and current account information and keep it updated.</li>
                  <li>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account, whether authorized or not.</li>
                  <li>You must implement reasonable administrative, technical, and physical safeguards appropriate to your use of the Service (including access controls for staff).</li>
                  <li>You must promptly notify the Company of any suspected unauthorized access or security incident involving your account.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.5 Subscription Plans, Fees, and Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Organizers access the Service through paid subscription plans as described in the applicable Order Form. Unless otherwise stated, subscriptions renew automatically each billing period.</li>
                  <li>You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period, and you will not be charged for subsequent billing periods after cancellation becomes effective.</li>
                  <li>Except where required by Applicable Law or expressly provided in writing by the Company, fees are non-refundable and no credits are provided for partial periods, unused features, downgrades, or periods of non-use.</li>
                  <li>Customers may register for free accounts to interact with Organizers. The Company may change, discontinue, or introduce Customer features at any time.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.6 Payments and Third-Party Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>The Service may integrate with third-party services (such as payment processors, hosting providers, analytics providers, communications providers, and AI model providers). These third parties may have their own terms and policies, and your use of those services may be subject to them.</li>
                  <li>Payment processing is typically provided by a third-party processor (e.g., Stripe). The Company does not store full payment card numbers. The Company may receive confirmation data and limited billing details necessary to provide the Service and manage subscriptions.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.7 Organizer-Customer Relationship; No Agency</h3>
                <p className="text-slate-700 mb-3">Organizers and Customers may enter into contracts and transactions outside or through the Service. The Company does not verify Organizers, does not guarantee Organizer performance, and does not act as an agent, broker, fiduciary, representative, or insurer for any Organizer or Customer.</p>
                <p className="text-slate-700">The Company is not responsible or liable for any: (a) Organizer goods or services; (b) Customer satisfaction; (c) refunds, returns, cancellations, rescheduling, or chargebacks; (d) injuries, losses, or damages arising from Organizer activities; or (e) disputes between Organizers and Customers.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.8 Acceptable Use</h3>
                <p className="text-slate-700 mb-3">You agree that you will not, and will not permit any third party to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Use the Service in violation of Applicable Law (including privacy, anti-spam, advertising, consumer protection, and intellectual property laws);</li>
                  <li>Upload, transmit, publish, or store Content that is unlawful, infringing, deceptive, defamatory, harassing, hateful, or otherwise harmful;</li>
                  <li>Introduce malware, attempt unauthorized access, probe or scan for vulnerabilities, interfere with the Service, or circumvent security or rate limits;</li>
                  <li>Misuse communications features (including sending spam or unsolicited commercial electronic messages);</li>
                  <li>Reverse engineer, decompile, or attempt to derive source code, except to the extent such restriction is prohibited by law;</li>
                  <li>Use the Service to develop or train a competing product using non-public aspects of the Service;</li>
                  <li>Misrepresent your identity, affiliation, offerings, pricing, or legal compliance.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.9 Strict Rule: Photos, Video, and Consent for Identifiable Individuals</h3>
                <p className="text-slate-700 mb-3">If you capture, upload, publish, or use images or videos that contain identifiable individuals (including Customers, guests, attendees, employees, or members of the public), you must obtain all required rights and consents in advance and you must be able to evidence such consents on request.</p>
                <p className="text-slate-700 font-semibold mb-2">Minimum requirements include:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Contracting Customer permission:</strong> Obtain written permission (e.g., a contract clause, email consent, or a platform consent checkbox with timestamp) before using any identifiable images/videos for portfolio, advertising, marketing, or social media.</li>
                  <li><strong>Guest/attendee permission:</strong> If guests or attendees are identifiable, obtain consent from each identifiable individual or ensure the contracting Customer has obtained and can produce appropriate permissions.</li>
                  <li><strong>Withdrawal:</strong> If consent is withdrawn, promptly cease use and remove the content where reasonably possible.</li>
                  <li><strong>Enforcement:</strong> The Company may remove Content, disable sharing features, restrict functionality, or suspend/terminate accounts for violations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.10 Content; Ownership; License to the Company</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>As between you and the Company, you retain ownership of your Content. You grant the Company a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, cache, reproduce, transmit, display, perform, modify (solely for formatting/technical processing), and otherwise process Content only as necessary to provide, secure, support, and improve the Service, and to comply with Applicable Law.</li>
                  <li>You represent and warrant that you have all rights, permissions, and consents necessary to submit and use your Content in connection with the Service, including rights for logos, trademarks, testimonials, photographs, videos, music, and personal information.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.11 AI Features; AI Output; Training and Confidentiality Limits</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>AI Features may generate outputs that are inaccurate, incomplete, misleading, or unsuitable for your intended purpose. You are solely responsible for reviewing, validating, and approving any AI output before using it, including before sending it to Customers or relying on it for business decisions.</li>
                  <li>You agree not to submit through AI Features (or otherwise through the Service) any sensitive or regulated information unless you have the lawful right to do so and it is necessary for the intended feature. Without limitation, do not submit: (a) health information or PHI; (b) financial account numbers; (c) government-issued IDs; (d) biometric identifiers; (e) passwords; or (f) confidential information of third parties, unless strictly required and lawfully disclosed.</li>
                  <li>AI model providers may process your inputs to generate outputs. You acknowledge and agree that prompts and other inputs you submit for AI Features may be transmitted to and processed by third-party AI model providers, and may be retained and used by such providers in accordance with their terms and policies. You are responsible for ensuring that any information you provide is appropriate for such processing and is not confidential or restricted.</li>
                  <li><strong>Product improvement and training:</strong> Where enabled by the Company, we may use (i) de-identified and aggregated usage data to improve the Service, and (ii) Content submitted to AI Features to improve AI Features and/or model performance, including via vendors, to the extent permitted by Applicable Law. If a setting is provided to opt out of training or product improvement use of Content, you may opt out; however, we may still process Content to provide the Service, maintain security, prevent fraud, comply with law, and enforce these Terms.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.12 Optional Use of Uploaded Images by the Company</h3>
                <p className="text-slate-700">By default, the Company stores uploaded images and other media to provide the Service (including storefront presentation, customer communications, and recordkeeping). The Company will not use your uploaded images for the Company's marketing or promotional purposes unless you provide explicit permission (for example, by written consent or enabling a designated Marketing Use setting). Any permitted marketing use may be revoked by you at any time, subject to reasonable timeframes to remove materials already published.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.13 Intellectual Property; Feedback</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>The Service and all underlying software, templates, designs, and documentation are owned by the Company or its licensors and are protected by intellectual property laws. Except for the limited rights expressly granted, no rights are granted to you.</li>
                  <li>If you submit suggestions, ideas, or feedback, you grant the Company a perpetual, irrevocable, worldwide, royalty-free license to use and incorporate them without compensation or attribution.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.14 Suspension; Termination</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>We may suspend, restrict, or terminate your access to the Service immediately (with or without notice) if we reasonably believe: (a) you have breached these Terms; (b) your use violates Applicable Law; (c) your account poses a security, privacy, legal, or reputational risk; (d) you repeatedly violate the consent/photo rules; or (e) we are required to do so by law or by a third-party provider.</li>
                  <li>You may stop using the Service and cancel your subscription at any time as described in Section 1.5.</li>
                  <li>Upon termination, your right to access the Service ends. Some Content may remain in backups for a limited period as described in the Data Retention Policy. Sections intended by their nature to survive termination will survive, including disclaimers, limitations of liability, indemnities, and governing law.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.15 Disclaimers</h3>
                <p className="text-slate-700 mb-3 uppercase">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE (INCLUDING AI FEATURES AND OUTPUTS) IS PROVIDED AS IS AND AS AVAILABLE, WITH ALL FAULTS AND WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, AND STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
                <p className="text-slate-700">We do not warrant that the Service will be uninterrupted, secure, error-free, or free from harmful components, or that any data will be accurate, complete, or preserved without loss.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.16 Limitation of Liability</h3>
                <p className="text-slate-700 mb-3 uppercase">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL THE COMPANY OR ITS DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, GOODWILL, BUSINESS, DATA, OR USE, ARISING OUT OF OR RELATING TO THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
                <p className="text-slate-700 mb-3 uppercase">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE FEES PAID BY YOU TO THE COMPANY FOR THE SERVICE IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
                <p className="text-slate-700">Some jurisdictions do not allow certain limitations of liability. In such cases, our liability will be limited to the minimum extent permitted by Applicable Law.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.17 Indemnity</h3>
                <p className="text-slate-700 mb-3">You agree to defend (at the Company's option), indemnify, and hold harmless the Company and its directors, officers, employees, and agents from and against any and all claims, demands, actions, proceedings, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Your or your users' use of the Service;</li>
                  <li>Your Content (including any allegation that Content infringes, misappropriates, or violates the rights of a third party);</li>
                  <li>Your products or services, and any contract or dispute between you and any Customer;</li>
                  <li>Your failure to obtain required rights, permissions, or consents (including for images/videos and marketing permissions);</li>
                  <li>Your violation of Applicable Law (including privacy, consumer protection, advertising, and anti-spam laws).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.18 Disputes; Governing Law; Venue</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>These Terms are governed by the laws of the Province of Manitoba and the federal laws of Canada applicable therein, without regard to conflict of laws principles.</li>
                  <li>Except where prohibited by Applicable Law (including non-waivable consumer protection rights), you agree that any dispute, claim, or proceeding arising out of or relating to these Terms or the Service will be brought exclusively in the courts located in Manitoba, Canada, and you submit to their jurisdiction.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.19 Changes to the Service and Terms</h3>
                <p className="text-slate-700">We may modify the Service or these Terms from time to time. We will post updated Terms and update the Last Updated date. If changes are material, we may provide additional notice (e.g., via the Service or email). Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1.20 Notices and Contact</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Notices to the Company should be sent to: info@zaaro.ai and/or by mail to: Zaaro AI Corp., 5 Essex Drive, Steinbach, Manitoba, R5G 2V7, Canada.</li>
                  <li>Notices to you may be provided by email, in-product notification, or by posting within the Service.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">3. Data Retention Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Purpose and Principles</h3>
                <p className="text-slate-700">This policy describes how long we retain data and how deletion or anonymization works. We retain data only as long as necessary to: (a) provide the Service; (b) maintain security and reliability; (c) comply with legal, tax, and accounting obligations; and (d) resolve disputes and enforce agreements.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Default Retention Schedule (Guideline)</h3>
                <p className="text-slate-700 mb-3">Retention periods may vary by plan, configuration, feature enablement, and legal requirements. Unless otherwise stated:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li><strong>Account profile data:</strong> retained while the account is active; upon deletion request, removed or anonymized within approximately 30-90 days, subject to legal/operational requirements.</li>
                  <li><strong>Booking and quote records:</strong> retained while the Organizer account is active; upon deletion request, removed or anonymized within approximately 30-180 days unless required for disputes or legal needs.</li>
                  <li><strong>Notification logs (delivery metadata):</strong> generally retained 12-24 months for troubleshooting and audit.</li>
                  <li><strong>Support/issue tickets:</strong> generally retained 24 months.</li>
                  <li><strong>Security/audit logs:</strong> generally retained 6-24 months.</li>
                  <li><strong>Usage analytics:</strong> retained in identifiable form generally 12-24 months; aggregated/de-identified analytics may be retained longer.</li>
                  <li><strong>Backups:</strong> rolling retention typically 30-60 days (data may persist until backup cycles expire).</li>
                  <li><strong>Billing and tax records:</strong> retained for the period required by Applicable Law (including CRA requirements).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.3 Deletion and Anonymization</h3>
                <p className="text-slate-700">When data is no longer needed, we delete it or anonymize it. Deletion occurs from active systems within the timeframes above, and from backups as backups expire. Certain records may be retained where required by law, for legitimate business purposes, or to establish, exercise, or defend legal claims.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.4 Organizer Responsibilities</h3>
                <p className="text-slate-700">Organizers are responsible for data they export or store outside the Service, including retention, deletion, and security obligations for exported data. Organizers are also responsible for responding to Customer requests relating to Organizer-controlled data, subject to Applicable Law.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">4. Billing Compliance Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Pricing and Plan Terms</h3>
                <p className="text-slate-700">Pricing, billing cycles, plan limits, and included features are displayed in the applicable Order Form and/or within the admin console. Prices are listed in Canadian dollars (CAD) unless stated otherwise.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Taxes</h3>
                <p className="text-slate-700">Applicable Canadian taxes may be charged (including GST/HST/PST/QST) depending on applicable tax rules and the billing address or location information you provide. You are responsible for any taxes not collected by the Company and for ensuring your tax information is accurate.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.3 Auto-Renewal and Cancellation</h3>
                <p className="text-slate-700">Subscriptions renew automatically unless cancelled before the renewal date. Cancellation becomes effective at the end of the current billing period unless otherwise stated in your plan. Cancel the subscription in the manage subscription section of the platform.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.4 Refunds</h3>
                <p className="text-slate-700">Fees are non-refundable and we do not provide refunds or credits for partial billing periods, except where required by Applicable Law or explicitly provided in writing by the Company.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.5 Failed Payments, Suspension, and Collections</h3>
                <p className="text-slate-700">If a payment fails, we may retry charges and may suspend, downgrade, or restrict access after 1 month notice. You authorize us and our payment processor to attempt to collect payments using your payment method(s) on file.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4.6 Chargebacks and Disputes</h3>
                <p className="text-slate-700">If you initiate a chargeback or payment dispute, we may suspend access while the dispute is investigated. You agree to provide reasonable information to help resolve billing disputes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Email Compliance Policy (Canada / CASL-Aligned)</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Scope</h3>
                <p className="text-slate-700">This policy applies to commercial electronic messages (CEMs) sent via the Service, including promotional emails and certain electronic messages sent on behalf of Organizers. Organizers are solely responsible for their compliance with Canada's Anti-Spam Legislation (CASL) and other Applicable Law.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Consent Requirements</h3>
                <p className="text-slate-700 mb-3">Promotional/offer messages must be sent only when:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>The recipient has provided express consent (recommended; opt-in checkbox not pre-checked), or</li>
                  <li>Another lawful basis applies (such as limited implied consent scenarios), and the Organizer can prove it.</li>
                </ul>
                <p className="text-slate-700 mt-3">The Company may require Organizers to represent, warrant, and evidence consent, and may restrict or suspend accounts for repeated violations.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Identification Requirements</h3>
                <p className="text-slate-700">Every CEM must clearly identify the sender (Organizer and/or Company as applicable) and include contact information and a physical mailing address as required by CASL.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.4 Unsubscribe Requirements</h3>
                <p className="text-slate-700">Every CEM must include a clear and functional unsubscribe mechanism. Unsubscribe requests must be processed promptly and no later than the timeframe required by CASL.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.5 Service vs Marketing Messages</h3>
                <p className="text-slate-700">Service/transactional messages (e.g., booking confirmations, invoices, security alerts) may be sent as necessary to provide the Service. Marketing/promotional messages require appropriate consent.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5.6 Records and Enforcement</h3>
                <p className="text-slate-700">We may maintain logs of platform-based consent and unsubscribe actions where available. Organizers are responsible for consent where they upload or import contacts. We may enforce these requirements by feature limitation, suspension, or termination.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Appendix A: Organizer Responsibilities Summary</h2>
            <p className="text-slate-700 mb-3">Without limiting any other obligation, Organizers are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Their products/services, performance, pricing, taxes, refunds, and customer disputes;</li>
              <li>Obtaining and maintaining all rights, permissions, and consents for Content (including photos/videos);</li>
              <li>Complying with privacy laws and CASL, including providing required notices and obtaining consent;</li>
              <li>Ensuring that information submitted to AI Features is lawful to disclose and is not confidential or sensitive unless appropriate;</li>
              <li>Maintaining appropriate security controls for their accounts and staff access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Appendix B: Company Contact Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Contact:</strong> info@zaaro.ai</li>
              <li><strong>Mailing Address:</strong> Zaaro AI Corp., 5 Essex Drive, Steinbach, Manitoba, R5G 2V7, Canada</li>
            </ul>
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
