"""Privacy Policy, Cookie Policy and Terms. Plain-language drafts that describe
only what the site and products verifiably do. They are NOT legal advice and
need review by a qualified professional before being relied on."""
from lib import *

UPDATED = 'November 11, 2026'


def page(path, title, desc, h1, sub, body):
    h = head(f'{title} | LearnTAV', desc, path, 2)
    h += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Legal</span>
                <h1 class="page-title">{h1}</h1>
                <p class="page-description">{sub}</p>
            </div>
        </div>
    </section>

    <section class="programs">
        <div class="container">
            <div class="legal-content">
                <div class="legal-updated"><strong>Last updated:</strong> {UPDATED}</div>
{body}
            </div>
        </div>
    </section>
'''
    h += foot(2)
    write(path + 'index.html', h)


PRIVACY = '''
                <p>This policy explains what LearnTAV collects through this website and what we do with it. It covers learntav.com only. Our products have their own policies: see the <a href="https://trophy-case-trophy-case.vercel.app/privacy.html" target="_blank" rel="noopener noreferrer">Trophy Case privacy policy</a> and the <a href="../../ai-tools/power-tracker/privacy.html">EcoPrompt privacy policy</a>.</p>

                <h2>1. What we collect</h2>
                <h3>Enrollment inquiries</h3>
                <p>When you send an enrollment inquiry for Vibe Coding 101, we collect what you enter: the student&rsquo;s name, email address, age range, group or private preference, prior coding experience, preferred start date, availability, time zone, optional project goals and questions, whether you&rsquo;d like an introductory conversation, and a confirmation that you understand the inquiry is not a booking. The form assigns a reference number. We do not ask for payment details on this website.</p>
                <h3>Messages and other forms</h3>
                <p>If you email us, or use one of our contact, consulting or sign-up forms hosted by Google Forms, we receive the information you provide.</p>
                <h3>Technical information</h3>
                <p>Like any website, our hosting provider and the third-party services below may process technical data such as your IP address and browser type when your device connects. We do not currently use analytics or advertising trackers on this website.</p>

                <h2>2. How we use it</h2>
                <ul>
                    <li>To reply to you, schedule sessions and share payment details after an inquiry</li>
                    <li>To run our courses and consulting work</li>
                    <li>To keep the website working</li>
                </ul>

                <h2>3. Who processes it</h2>
                <p>We do not sell your personal information. We use these services to operate the website:</p>
                <ul>
                    <li><strong>Formspree</strong> receives enrollment inquiries and forwards them to our email inbox.</li>
                    <li><strong>Google</strong> provides Google Forms (some sign-up and contact forms) and Google Fonts (the website loads its typeface from Google, which means Google receives your IP address and browser details).</li>
                    <li>Our <strong>hosting provider</strong> serves the website.</li>
                </ul>
                <p>We may also disclose information when required by law.</p>

                <h2>4. Storage on your device</h2>
                <p>The website stores your light or dark display choice in your browser&rsquo;s local storage. We do not set cookies of our own. See the <a href="../cookies/index.html">Cookie Policy</a>.</p>

                <h2>5. How long we keep it</h2>
                <p>We keep enrollment and contact information for as long as we need it to respond and run the program. You can ask us to delete your information at any time by emailing us.</p>

                <h2>6. Young learners</h2>
                <p>Our courses are open to learners of different ages, and the enrollment form asks for an age range. If you are enrolling a young learner, please have a parent or guardian submit the inquiry using their own email address. If you believe a child has given us personal information without a parent or guardian&rsquo;s knowledge, email us and we will delete it.</p>

                <h2>7. Security</h2>
                <p>We rely on reputable third-party services and encrypted connections. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.</p>

                <h2>8. Your choices</h2>
                <p>You can ask to see, correct or delete the information we hold about you by emailing us.</p>

                <h2>9. Changes</h2>
                <p>If we change this policy, we will update the date above.</p>

                <h2>Contact</h2>
                <p>Email <a href="mailto:hello@learntav.com">hello@learntav.com</a>.</p>
'''

COOKIES = '''
                <h2>What we use</h2>
                <p>This website does not set cookies of its own. It currently uses no analytics cookies and no advertising cookies.</p>
                <p>It stores one item in your browser&rsquo;s local storage, named <code>theme</code>, to remember whether you chose light or dark display. It never leaves your device, and you can clear it in your browser settings.</p>

                <h2>Third-party services</h2>
                <p>The website loads its typeface from Google Fonts. Some pages link to services run by others, such as Google Forms, Formspree, the Chrome Web Store, Trophy Case, YouTube, Instagram and Facebook. When you visit those, they may set their own cookies under their own policies.</p>

                <h2>Changes</h2>
                <p>If we add analytics or any other cookie in the future, we will update this page first.</p>

                <h2>Questions</h2>
                <p>Email <a href="mailto:hello@learntav.com">hello@learntav.com</a>.</p>
'''

TERMS = '''
                <p>By using this website or our services you agree to these terms.</p>

                <h2>1. What we offer</h2>
                <ul>
                    <li><strong>Education:</strong> live courses such as Vibe Coding 101</li>
                    <li><strong>Custom builds and consulting:</strong> scoped and quoted individually</li>
                    <li><strong>Products:</strong> Trophy Case and EcoPrompt, which have their own privacy policies and are provided as-is</li>
                    <li><strong>Free content:</strong> guides, articles and resources</li>
                </ul>

                <h2>2. Enrollment inquiries are not bookings</h2>
                <p>Submitting the enrollment form is an inquiry only. A place is not confirmed until we reply and agree details with you. This website does not take payments. We arrange payment with you directly after we have been in touch. Pricing shown on the website is per student for the full four-session course.</p>

                <h2>3. Costs not included</h2>
                <p>Course prices do not include third-party AI subscriptions, API credits, hosting, domains or other tools. Those are set by their providers.</p>

                <h2>4. Results vary</h2>
                <p>What a student completes in a course depends on the project scope and the student&rsquo;s progress. We do not guarantee specific results, outcomes or a completed application.</p>

                <h2>5. Acceptable use</h2>
                <p>Please do not break the law, harass others, attempt to access our systems without permission, or copy and resell our content without permission.</p>

                <h2>6. Intellectual property</h2>
                <p>The website content, including text, graphics and logos, belongs to LearnTAV or its licensors. You may view it for personal or business use.</p>

                <h2>7. Disclaimers</h2>
                <p>The website and products are provided &ldquo;as is&rdquo; without warranties. Estimates, such as the energy figures shown by EcoPrompt, are approximations, and AI tools can make mistakes.</p>

                <h2>8. Limitation of liability</h2>
                <p>To the extent permitted by law, LearnTAV is not liable for indirect or consequential damages arising from use of the website or products.</p>

                <h2>9. Changes</h2>
                <p>We may update these terms and will change the date above when we do.</p>

                <h2>Contact</h2>
                <p>Email <a href="mailto:hello@learntav.com">hello@learntav.com</a>.</p>
'''

page('legal/privacy/', 'Privacy Policy', 'How LearnTAV handles information collected through learntav.com.', 'Privacy Policy', 'What we collect through this website and how we use it.', PRIVACY)
page('legal/cookies/', 'Cookie Policy', 'LearnTAV does not set cookies of its own and currently uses no analytics or advertising cookies.', 'Cookie Policy', 'How this website uses cookies and browser storage.', COOKIES)
page('legal/terms/', 'Terms of Service', 'Terms for using the LearnTAV website, courses and products.', 'Terms of Service', 'Terms for using LearnTAV services.', TERMS)
print('legal ok')
