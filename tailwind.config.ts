import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			raised: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
  			float: '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
  			elevated: '0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
  			glow: '0 0 20px -5px hsl(225 73% 57% / 0.25)',
  			'glow-lg': '0 0 40px -10px hsl(225 73% 57% / 0.3)',
  		},
  		fontSize: {
  			display: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { backgroundPosition: '200% 0' },
  				'100%': { backgroundPosition: '-200% 0' },
  			},
  			fadeUp: {
  				from: { opacity: '0', transform: 'translateY(12px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			checkPop: {
  				'0%': { transform: 'scale(0)' },
  				'70%': { transform: 'scale(1.2)' },
  				'100%': { transform: 'scale(1)' },
  			},
  			pulseGlow: {
  				'0%, 100%': { boxShadow: '0 0 15px -5px hsl(225 73% 57% / 0.3)' },
  				'50%': { boxShadow: '0 0 25px -5px hsl(225 73% 57% / 0.5)' },
  			},
  		},
  		animation: {
  			shimmer: 'shimmer 1.5s ease-in-out infinite',
  			'fade-up': 'fadeUp 0.4s ease-out',
  			'check-pop': 'checkPop 0.3s ease-out',
  			'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
