"use client";

export function StorefrontGlobalStyles() {
    return (
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
            @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

            /* Fonts */
            .font-serif { font-family: 'Playfair Display', serif; }
            .font-sans { font-family: 'Inter', sans-serif; }
            
            /* Utility Classes matching VariantClaudeSonnet4 */
            .text-gold { color: var(--color-gold-primary); }
            .text-charcoal { color: var(--color-charcoal-primary); }
            .bg-gold { background-color: var(--color-gold-primary); }
            .bg-gold-20 { background-color: var(--color-gold-20); }
            .bg-lightGray { background-color: var(--color-bg-light); }
            .bg-charcoal { background-color: var(--color-charcoal-primary); }
            .hover\\:bg-darkGold:hover { background-color: var(--color-gold-dark); }
            .hover\\:text-gold:hover { color: var(--color-gold-primary) !important; }
            
            /* Navigation Links */
            .nav-link {
                position: relative;
                overflow: hidden;
                transition: color 0.3s ease;
            }
            
            .nav-link:hover {
                color: var(--color-gold-primary) !important;
            }
            
            .nav-link::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 2px;
                background: var(--color-gold-primary);
                transition: width 0.3s ease;
            }
            
            .nav-link:hover::after {
                width: 100%;
            }

            /* Buttons */
            .btn-primary {
                background: var(--gradient-gold);
                color: var(--color-text-light);
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .btn-primary:hover {
                background: transparent;
                background-image: none;
                color: var(--color-gold-primary);
                border-color: var(--color-gold-primary);
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px var(--color-black-10), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .btn-secondary {
                background: transparent;
                color: var(--color-text-primary);
                border: 2px solid var(--color-gold-primary);
                transition: all 0.3s ease;
            }
            
            .btn-secondary:hover {
                background: var(--color-gold-primary);
                color: var(--color-text-light);
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px var(--color-black-10), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            
            /* Backgrounds */
            .gradient-bg {
                background: var(--gradient-charcoal);
            }
            
            .gold-gradient {
                background: var(--gradient-gold);
            }
            
            .hero-pattern {
                background-image:
                    radial-gradient(circle at 25% 25%, var(--color-gold-10) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, var(--color-gold-05) 0%, transparent 50%);
            }
            
            /* Cards */
            .card-hover {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .card-hover:hover {
                transform: translateY(-8px);
                box-shadow: 0 25px 50px -12px var(--color-black-25);
            }
            
            .testimonial-card {
                background: linear-gradient(145deg, var(--color-bg-white) 0%, #f9f9f9 100%);
            }
            
            /* Animations */
            .animate-fade-in {
                animation: fadeIn 0.6s ease-out forwards;
            }
            
            .animate-slide-up {
                animation: slideUp 0.8s ease-out forwards;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .service-icon {
                background: var(--gradient-gold);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        `}</style>
    );
}
