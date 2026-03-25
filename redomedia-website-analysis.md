# Redomedia.co Website Analysis - Complete Breakdown

**Website URL:** https://redomedia.co/  
**Platform:** Framer  
**Date Analyzed:** March 1, 2026

---

## 1. PAGE STRUCTURE

### Single-Page Scroll Architecture
The website is a **single-page scroll design** with anchor links in navigation. The page flows vertically through distinct sections:

1. **Hero Section** (Top)
2. **Trusted By Section** (Logo carousel)
3. **Journey Selection Section** ("Where are you in your journey?")
4. **Services Section** (#services)
5. **CTA Section** ("Build Your Vision With Us")
6. **Featured Work Section** (#work)
7. **Trusted By Section** (Repeated with different copy)
8. **Reviews Section** (#reviews)
9. **Stats Section** (Years, Projects, Industries)
10. **Meet the Founders Section** (Footer area)

### Navigation Structure
- **Hash-based routing** with sections accessible via `#services`, `#work`, `#reviews`, `#mobile-reviews`
- Single-page with smooth scroll to sections
- Likely uses Framer's built-in scroll-to-anchor functionality

---

## 2. NAVIGATION

### Desktop Navigation
- **Brand Link:** "Redo." (links to homepage)
- **Menu Items:**
  - Services (scrolls to #services)
  - Featured Work (scrolls to #work)
  - Reviews (scrolls to #reviews)
  - Get In Touch (mailto:founders@redomedia.co)

### Likely Behavior (Based on Framer Standards)
- **Sticky/Fixed navigation** - Framer typically implements sticky headers by default
- **Scroll state changes** - Navigation likely changes appearance on scroll (background opacity, border, or backdrop blur)
- **Mobile variant** - Separate mobile navigation detected in HTML (#mobile-reviews suggests responsive design)

### Mobile Navigation
- Different anchor target for reviews: `#mobile-reviews` (suggests different layout/interaction on mobile)
- Likely hamburger menu pattern for mobile

---

## 3. HERO SECTION

### Content Structure
**Headline (Repeating Pattern):**
The hero headline appears **4 times** in the HTML, suggesting a scroll-reveal or staggered animation pattern:

> "We craft brand identities, narratives, and digital experiences that keep up with your ambition. So you can focus on building what matters, while we shape how the world sees it."

### Likely Animations
Based on Framer and parallax design patterns:
- **Text reveal animation** - Likely word-by-word or line-by-line fade/slide in
- **Staggered reveals** - The 4x repetition suggests layered text that animates sequentially
- **Parallax background** - Given the site uses parallax scrolling (confirmed)
- **Hero text scale/fade on scroll** - Common Framer pattern
- Possible **gradient or color shift** background
- Potential **cursor follow effect** or custom cursor

### Typography Treatment
- Multiple instances suggest **animated typography** (possibly morphing or revealing text)
- Likely **large, bold headline treatment**
- Copy emphasizes brand positioning and value proposition

---

## 4. SCROLL ANIMATIONS

### Confirmed Animation Types
Based on analysis and platform capabilities:

**Parallax Scrolling:**
- Different scroll speeds for background vs. foreground elements
- Creates depth and 3D-like effect
- Confirmed as primary design feature

**Scroll-Triggered Animations:**
- Elements animate into view as user scrolls
- Sections reveal progressively

**Likely Animation Patterns:**

1. **Fade In on Scroll**
   - Sections fade from 0 to 100% opacity
   - Triggered when elements enter viewport

2. **Slide In Animations**
   - Elements slide in from left, right, bottom
   - Service cards likely slide in sequentially

3. **Scale Animations**
   - Elements scale from 0.8 to 1 on reveal
   - Featured work cards likely scale on reveal

4. **Stagger Effects**
   - Service items (01-06) likely animate in sequence
   - Logo carousel probably has staggered reveals
   - Review cards animate with delay between each

5. **Parallax Depth Layers**
   - Background elements move slower than foreground
   - Creates depth perception
   - Likely applied to hero and section backgrounds

---

## 5. INTERACTIVE ELEMENTS

### Hover Effects (Expected)

**Navigation Links:**
- Underline animation or color change
- Smooth transition effects

**CTA Buttons:**
- "Build Your Vision With Us"
- "Get In Touch"
- Likely: Background color shift, scale slightly, shadow increase

**Featured Work Cards:**
- 5 portfolio items with links
- Expected hover: Image zoom/scale, overlay fade in, text slide up
- Possible parallax tilt effect on hover

**Service Cards (01-06):**
- Numbered service sections
- Expected hover: Background color change, border glow, lift effect (translateY)

**Social Links (Founders):**
- LinkedIn and Instagram icons
- Expected: Color change, scale, or icon animation

### Click Interactions
- Smooth scroll to anchored sections
- Email link opens default mail client
- External links to portfolio case studies
- Social media links to profiles

### Cursor Effects
Framer sites often include:
- Custom cursor design
- Cursor scale changes on hover
- Possible cursor trail or glow effect
- Cursor state changes (pointer to grab, etc.)

---

## 6. TYPOGRAPHY

### Font System
**Primary Typeface:** Serif (confirmed from research)
- Framer often uses system fonts or custom web fonts
- Likely a modern serif like:
  - **Fraunces**, **Crimson Pro**, **Playfair Display**, or **Canela**
  - Or custom font from Adobe Fonts/Google Fonts

### Type Hierarchy

**Hero Text:**
- **Size:** Very large (likely 60-120px on desktop)
- **Weight:** Bold/Semibold (600-700)
- **Line height:** Tight (1.1-1.3)
- **Letter spacing:** Tight (-0.02em to -0.01em)

**Section Headlines:**
- "With our services", "Featured work", "Hear from our partners"
- **Size:** Large (40-60px)
- **Weight:** Semibold/Bold
- **Text transformation:** Mixed case

**Body Copy:**
- Service descriptions, testimonials
- **Size:** 16-20px
- **Weight:** Regular (400)
- **Line height:** Comfortable reading (1.5-1.7)

**Navigation:**
- **Size:** 14-16px
- **Weight:** Medium (500)
- **Spacing:** Adequate touch targets

### Special Typographic Treatments

1. **Repetition for Emphasis**
   - "Trusted by 60+ Organizations" appears multiple times
   - Creates rhythm and reinforcement

2. **Number Styling**
   - Service numbers: (01), (02), etc.
   - Stats: "016+ Years", "24+ Projects", "0+ Industries" [Note: "0+" appears to be a data error or animation initial state]

3. **Quote Formatting**
   - Testimonials in quotation marks
   - Author name and title in different weights/sizes

4. **Headline Breaks**
   - Strategic line breaks for visual interest
   - "Where are you in\nyour journey?"
   - "We've transformed bold ideas\ninto tangible realities"

---

## 7. LAYOUT PATTERNS

### Grid System
Framer uses CSS Grid and Flexbox:

**Multi-Column Layouts:**
- Services section: Likely 2-3 column grid
- Featured work: Card-based grid (possibly Bento-style)
- Reviews: Multi-column testimonial grid
- Founders: 2-column layout

**Responsive Breakpoints:**
- Desktop: Full multi-column layouts
- Tablet: Reduced columns
- Mobile: Single column stack (detected separate #mobile-reviews anchor)

### Section Patterns

**Full-Width Sections:**
- Hero section spans full viewport
- Review carousel sections
- "Trusted by" logo sections

**Contained Sections:**
- Services grid
- Featured work cards
- Stats section
- Content likely constrained to max-width container (1200-1440px)

**Padding/Spacing:**
- Large section spacing (120-200px between major sections)
- Generous white space
- Breathing room around elements

### Asymmetric Elements

**Service Cards:**
- Left-aligned numbers (01, 02, etc.)
- List of services likely in two columns within each card

**Featured Work:**
- 5 portfolio items suggesting asymmetric grid
- Likely masonry or varied card sizes
- First item might be larger (hero treatment)

**Text Alignment:**
- Headlines likely center-aligned
- Body copy left-aligned
- Some sections may use mixed alignment for visual interest

---

## 8. COLOR SCHEME

### Theme: Dark Mode Aesthetic

**Background Colors:**
- Likely deep dark blue, dark gray, or true black
- Possible gradient backgrounds
- Subtle texture overlays

**Text Colors:**
- Primary: White or off-white (#FFFFFF, #F5F5F5)
- Secondary: Light gray for body copy (#B0B0B0, #D0D0D0)
- Possibly accent color for links/hover states

**Accent Colors:**
- Brand accent (possibly teal, purple, or vibrant color)
- Used for CTAs, hover states, highlights
- Service number indicators

**Card/Section Backgrounds:**
- Slightly lighter than page background
- Subtle borders or glows
- Transparency effects with backdrop blur

### Color Usage Patterns

**Navigation:**
- Dark background with light text
- Possibly subtle background on scroll

**CTAs:**
- "Build Your Vision With Us" - Likely prominent accent color
- "Get In Touch" - Possibly outlined or secondary style

**Service Cards:**
- Numbered sections (01-06)
- Each may have subtle color differentiation
- Or consistent dark card style

**Featured Work:**
- Image-based cards with overlay
- Text overlay in white/light colors
- Hover reveals full color

**Review Cards:**
- Light text on dark background
- Author info possibly de-emphasized with lower opacity
- Quote marks or decorative elements

---

## 9. FOOTER

### "Meet the Founders" Section

**Content:**
- **Headline:** "Get in touch with us" / "Meet the founders"
- **Subheadline:** "We're always up for a good coffee chat" / "Connect with us, we're always up for a good coffee chat"

**Founders:**

**1. Bhini Dave**
- Co-Founder, Head of Marketing
- LinkedIn: https://www.linkedin.com/in/bhinidave/
- Instagram: https://www.instagram.com/bhini.dave/?hl=en

**2. Preet Ghelani**
- Co-Founder, Head of Design
- LinkedIn: https://www.linkedin.com/in/preet-ghelani-6159641b4/
- Instagram: https://www.instagram.com/preetghelani

### Footer Design Pattern
- Likely features founder photos/avatars
- 2-column layout with social links
- Personal touch with "coffee chat" invitation
- Minimal, clean footer design
- Social icons with hover effects

### No Traditional Footer
- No sitemap or footer links
- No copyright or legal links visible
- Focus on personal connection over formality
- Brand confidence through simplicity

---

## 10. SPECIAL EFFECTS

### WebGL/Canvas Effects
**Possible but not confirmed:**
- Framer supports WebGL effects
- Could include particle effects, gradient animations, or morphing shapes

### Video/Motion
**Confirmed Services:**
- Motion Design is a service offering
- Likely showcases motion work in Featured Work section
- Possible video backgrounds or animated graphics

### Loading Animation
**Expected:**
- Framer sites typically include page load animation
- Possible logo animation or progress indicator
- Content fade-in sequence on initial load

### Parallax Effects (Confirmed)
- Multi-layer parallax scrolling
- Different scroll speeds for background/foreground
- Creates depth and immersion

### Background Effects
**Likely Includes:**
- Gradient animations
- Noise/grain texture overlay
- Subtle color shifts on scroll
- Backdrop blur on navigation

### Scroll Progress Indicator
- Possible scroll progress bar at top
- Section indicators showing current position

### Smooth Scrolling
- Locomotive Scroll or Lenis (common with Framer)
- Buttery smooth, inertia-based scrolling
- Enhances the parallax effect

### Cursor Interactions
- Custom cursor design
- Scale changes on hover
- State changes for different elements

### Image Effects
- Lazy loading for performance
- Ken Burns effect (subtle zoom) on scroll
- Grayscale to color on hover for portfolio images

---

## 11. MOBILE BEHAVIOR

### Responsive Design Indicators

**Separate Mobile Sections:**
- `#mobile-reviews` anchor suggests distinct mobile layout for reviews
- Likely different card arrangement or carousel pattern

**Expected Mobile Adaptations:**

**Navigation:**
- Hamburger menu
- Full-screen mobile menu overlay
- Possibly animated menu icon

**Hero:**
- Smaller headline text (32-48px)
- Single column layout
- Reduced parallax effects (performance)

**Services:**
- Stack from grid to single column
- Horizontal swipe for service cards
- Or accordion/expandable pattern

**Featured Work:**
- Single column stack
- Or horizontal scroll carousel
- Tap to view case study

**Reviews:**
- Horizontal carousel
- Swipe interaction
- Dot indicators for pagination

**Founders Section:**
- Stack to single column
- Larger touch targets for social links

**Scroll Behavior:**
- Reduced parallax intensity (battery/performance)
- Simpler animations
- Faster transitions

**Touch Interactions:**
- Tap instead of hover states
- Swipe gestures for carousels
- Pull to refresh (if applicable)

---

## CONTENT BREAKDOWN

### Services Offered (01-06)

**(01) Brand Strategy**
- Brand Positioning
- Logo Design
- Brand Guidelines
- Pitch Decks
- Packaging Design
- Brand Revamps

**(02) Websites**
- Website Design & Development
- Web Apps & Platforms
- Web Revamps
- Conversion Rate Optimisations
- Search Engine Optimisation (SEO)
- Website Management

**(03) Product Design**
- User Research & Analysis
- UX Audits
- MVP Planning & Design
- UI Design & Prototyping [Note: Typo in original: "Prototypying"]
- Product Management

**(04) AI-Powered Solutions**
- AI Applications
- Agentic AI Orchestration
- SaaS Products
- AI Chatbots
- AI Automations
- Intelligent Integrations

**(05) Motion Design**
- Motion Graphics
- Explainer Videos
- Brand Launch Videos
- Interactive Presentations

**(06) Full-stack Marketing**
- Marketing & Growth Strategy
- Emails & Newsletters
- Copywriting
- Technical Content Writing
- Campaigns
- Social Media Management
- Community, Events, Podcasts
- Strategic Partnerships
- Personal Brand Management

---

### Featured Work (5 Case Studies)

1. **ConvertIAS** - Strategic Design & Marketing
   - Tags: Marketing, Brand Identity, Product Design
   - Link: /featured-work/convertias

2. **Lifesight** - Web Design for Martech SaaS Company
   - Tags: Website, Creative Direction
   - Link: /featured-work/lifesight

3. **Ashar Locker** - Brand Revamp for Global Expansion
   - Tags: Brand Identity
   - Link: /featured-work/ashar-locker

4. **ServeOS** - Brand Identity for AI Venture
   - Tags: Brand Strategy, Merch, Pitch Decks
   - Link: /featured-work/serveos

5. **CSE Naukri** - MVP Design Sprint
   - Tags: Product Design, Website
   - Link: /featured-work/cse-naukri

---

### Journey Selection Section

**Three Paths:**

**1. Going Zero to One**
- For: New business units, new ventures, breaking into new markets
- Target audience: Early-stage founders, corporate innovation teams

**2. Scaling from One to N**
- For: Companies that achieved Product/Service Market Fit looking to scale
- Target audience: Growth-stage startups, established businesses expanding

**3. Need Quick Solutions**
- For: Teams that know what they want and need fast execution
- Target audience: Companies with clear requirements, project-based needs

---

### Client Testimonials (12 Reviews)

1. **Siim Säinas** - Founder @ SUMA
2. **Graham Thompson** - Founder @ Greeter
3. **Paritosh Anand** - Founder & Influencer, 650k+ Followers @ WESMILE MEDIA
4. **Ridhi Singh** - Founder @ 91Ninjas, Ex-PayU
5. **Shrikant Damani** - Founder's office @ 91Ninjas
6. **Adnan J.** - Ex-Microsoft, Founder @ SupaStellar
7. **Brajraj L.** - Founder @ ConvertIAS
8. **Toshan Nimai Das** - Author & Monk @ ISKCON
9. **Dr. Shilpa Mehta** - Founder, Director @ Foster Care Society
10. **Manen C.** - Founder, Creative Director @ Typezero
11. **Chandraprakash Loonker** - Founder @ CheerChampion
12. **Devashish Mishra** - State Consultant, UNICEF India

---

### Stats Section

**016+ Years of Experience**
- Copy: "We've spent years solving complex product, design, and marketing challenges. From startups to global teams, our experience lets us move fast and build what truly matters."

**24+ Projects Delivered**
- Copy: "We've shaped products that perform and scale, delivering everything from MVPs to enterprise platforms with clarity, speed, and intent."

**0+ Industries Impacted** [Note: "0+" likely animation initial state or typo]
- Copy: "Working across industries like AI, finance, fintech, fashion, gaming, education, and manufacturing, we bring fresh thinking by cross-pollinating ideas in every project."

---

## KEY TAKEAWAYS & IMPLEMENTATION NOTES

### Design Philosophy
- **Confidence through simplicity:** No cluttered footer, no excessive navigation
- **Personal touch:** Founder-forward branding, "coffee chat" language
- **Portfolio as proof:** Featured work prominently displayed
- **Social proof:** 60+ clients, 12 testimonials
- **Clear positioning:** Three journey paths segment audience clearly

### Technical Stack (Confirmed/Likely)
- **Platform:** Framer
- **Animations:** Framer Motion (built-in)
- **Scrolling:** Likely Lenis or Locomotive Scroll
- **Typography:** Serif system (modern, bold headlines)
- **Hosting:** Framer hosting infrastructure
- **Performance:** Lazy loading, optimized assets

### Animation Strategy
1. **Entrance:** Page load with staggered reveals
2. **Scroll:** Parallax, fade-ins, slide-ins throughout
3. **Hover:** Interactive feedback on all clickable elements
4. **Exit:** Smooth transitions to external links

### UX Patterns
- **Single-page flow:** Reduces friction, encourages exploration
- **Anchor navigation:** Quick jump to relevant sections
- **CTA placement:** Strategic CTAs after services and work sections
- **Social proof placement:** Reviews after work showcase
- **Personal connection:** Founders section as closer

### Content Strategy
- **Value-first messaging:** Lead with what they do for clients
- **Credibility building:** Stats, testimonials, client logos
- **Journey mapping:** Three clear entry points for different stages
- **Case study depth:** Separate pages for portfolio deep-dives
- **Accessibility:** Email contact, social links, clear hierarchy

---

## ANIMATION TIMELINE (HYPOTHETICAL)

### Page Load (0-2s)
1. Logo fade in (0-0.3s)
2. Navigation slide in from top (0.3-0.5s)
3. Hero headline word-by-word reveal (0.5-1.5s)
4. Hero subtext fade in (1.5-1.8s)
5. Scroll indicator animation (2s+, loop)

### On Scroll Events

**Section Entry Animations:**
- Section headline fade + slide up
- Body text fade in (0.1s delay)
- Grid items stagger in (0.1s between each)

**Parallax Layers:**
- Background: 0.3x scroll speed
- Mid-ground: 0.6x scroll speed
- Foreground: 1x scroll speed

**Specific Sections:**

**Services (01-06):**
- Number fade in
- Card background expand
- Service list items stagger (0.05s each)

**Featured Work:**
- Card 1: Fade + scale (0s)
- Card 2: Fade + scale (0.1s)
- Card 3: Fade + scale (0.2s)
- Card 4: Fade + scale (0.3s)
- Card 5: Fade + scale (0.4s)

**Reviews:**
- Cards slide in from left (desktop)
- Horizontal scroll carousel (mobile)

**Stats:**
- Number count-up animation (from 0 to final)
- Description fade in after numbers

---

## DESIGN PATTERNS IDENTIFIED

### Modern Web Design Trends
✅ Dark mode aesthetic  
✅ Parallax scrolling  
✅ Single-page application feel  
✅ Generous white space  
✅ Large typography  
✅ Scroll-triggered animations  
✅ Custom cursor (likely)  
✅ Smooth scrolling  
✅ Card-based layouts  
✅ Social proof emphasis  
✅ Minimal navigation  
✅ Founder-forward branding  
✅ Journey-based segmentation  

### Framer-Specific Patterns
✅ Built-in animation library  
✅ Component-based structure  
✅ Responsive variants  
✅ Scroll sections  
✅ CMS for case studies (likely)  
✅ Code overrides for custom interactions (possible)  

---

## RECOMMENDATIONS FOR SIMILAR IMPLEMENTATION

### If Building Similar Site:

1. **Use Framer** for rapid prototyping and native animation support
2. **Implement parallax** sparingly (3-4 key sections max for performance)
3. **Stagger animations** for natural, non-jarring reveals
4. **Limit section count** (8-10 max to avoid scroll fatigue)
5. **Optimize images** heavily (WebP, lazy loading, responsive images)
6. **Test mobile thoroughly** (parallax can hurt mobile performance)
7. **Use system fonts or subset custom fonts** for speed
8. **Implement smooth scrolling library** (Lenis recommended)
9. **Add loading state** to manage entrance animations
10. **A/B test CTA placement** (current placement after services and work is strategic)

### Performance Considerations:
- Parallax adds scroll jank risk
- Test on mid-range devices
- Reduce motion for accessibility (prefers-reduced-motion)
- Lazy load below-fold content aggressively
- Consider scroll hijacking impact on UX

---

## CONCLUSION

Redomedia.co is a **high-quality, design-forward portfolio site** that effectively demonstrates the agency's capabilities through its own design and interactions. Built on **Framer** with **parallax scrolling**, **scroll-triggered animations**, and a **dark aesthetic**, it prioritizes visual impact while maintaining usability.

The **single-page structure** with strategic CTAs, **journey-based segmentation**, and **extensive social proof** creates a compelling narrative that moves visitors from awareness to action. The **founder-forward branding** and personal touches ("coffee chat") differentiate it from typical corporate agency sites.

The site balances **bold visual design** with **clear information architecture**, making it both impressive and functional—exactly what you'd expect from a design agency showcasing their craft.

---

**End of Analysis**
