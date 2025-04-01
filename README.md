
# Digital Transformation Business Site

This is a modern, clean, and responsive Single Page Application (SPA) built with React and Tailwind CSS. The site is designed to convert leads for a digital transformation business that helps small and medium businesses (SMBs) and overlooked industries modernize their operations using technology.

## Features

- Modern, minimalist design with ample whitespace
- Fully responsive layout for all devices
- Config-driven content management
- Clean separation of content, UI, and logic
- Subtle animations and interactions
- Performance optimized

## Tech Stack

- React with Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React (for icons)

## Project Structure

```
/
├── public/
│   └── content.json     # Configuration file for content
├── src/
│   ├── components/      # React components for each section
│   ├── hooks/           # Custom hooks including useContent
│   ├── pages/           # Page components
│   └── App.tsx          # Main app component
├── README.md            # This file
└── ...                  # Other configuration files
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/digital-transformation-site.git
   cd digital-transformation-site
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Content Management

### Local Content

The site's content is managed through a JSON file located at `public/content.json`. This file contains all the text, links, and image URLs used throughout the site.

### JSON Structure

The content configuration is structured as follows:

```json
{
  "hero": {
    "headline": "Headline text",
    "subheadline": "Subheadline text",
    "image": "URL to hero image",
    "cta": "CTA button text",
    "ctaLink": "CTA button link"
  },
  "services": [
    {
      "icon": "URL to service icon",
      "title": "Service title",
      "desc": "Service description",
      "image": "URL to service image"
    }
  ],
  "founder": {
    "photo": "URL to founder photo",
    "bio": "Founder bio text",
    "timeline": [
      { "year": "Year", "event": "Event description" }
    ]
  },
  "caseStudies": [
    {
      "title": "Case study title",
      "subtitle": "Case study subtitle",
      "image": "URL to case study image",
      "before": "Before description",
      "after": "After description"
    }
  ],
  "form": {
    "headline": "Form headline",
    "fields": ["Field1", "Field2", "Field3"],
    "submitText": "Submit button text",
    "submitUrl": "Form submission endpoint"
  },
  "footer": {
    "tagline": "Footer tagline",
    "socialLinks": {
      "LinkedIn": "LinkedIn URL",
      "Calendly": "Calendly URL"
    }
  }
}
```

### Remote Content (Future)

The site is designed to easily switch to remote content sources like Airtable or Google Sheets. To enable this:

1. Create a `.env` file in the project root
2. Add the following variable:
   ```
   VITE_CONTENT_URL=https://your-content-api-endpoint.com
   ```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Log in to Vercel and import your repository
3. Configure the build settings:
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `dist`
4. Click "Deploy"

### Deploying to Replit

1. Create a new Replit from GitHub
2. Connect your repository
3. Set the run command to `npm run dev` or `yarn dev`
4. Click "Run"

## Customization

### Changing Colors

To change the theme colors, edit the `tailwind.config.ts` file and update the color variables.

### Adding New Sections

1. Create a new component in the `src/components` directory
2. Add the corresponding data structure to the content.json file
3. Import and include the component in the `src/pages/Index.tsx` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.
