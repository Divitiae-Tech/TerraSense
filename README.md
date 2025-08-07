# TerraSense
2025 Hackathon Application - Divitiae Tech AI Assisted Agriculture management app

# TerraSense

## 💡 Project Name  
**TerraSense**: AI-Powered Agriculture Assistant

---

## 👨‍💻 Team  
**Team Name:** Divitiae (De-Vit-C-A) Technologies  

**Team Members:**  
- Yavin Mc Pherson
- Shane Pelser 
- Byron Knight
- Simphiwe Khumalo

---

## 🚀 The Problem  
In an era of rapid climate change and increasing global food needs, agriculture stands at a critical juncture. Farmers are often left grappling with uncertainty, relying on traditional methods to manage crops, detect threats, and optimize yields. This leads to inefficiencies, wasted resources, and lost potential.

---

## 🌱 Our Solution: TerraSense  
**TerraSense** is a modern, AI-powered agriculture assistant platform designed to empower farmers with intelligent, data-driven insights. By bridging the gap between traditional farming and advanced technology, TerraSense helps farmers make more informed decisions, leading to healthier crops, increased yields, and a more sustainable future.

---

## ✨ Key Features (MVP)

### 1. Crop Planning & Yield Optimization
- **AI-based Crop Calendar**: Generates optimized planting, fertilizing, and harvesting schedules based on real-time weather, soil type, and crop seasonality.
- **Google Calendar Sync**: Seamlessly syncs the auto-generated crop calendar and tasks to a user's personal Google Calendar for easy management and reminders.

### 2. Crop Health & Disease Detection
- **Image-Based AI Detection**: Users can upload images of their plants, and our integrated AI API will instantly detect diseases, nutrient deficiencies, or pest infestations.
- **Treatment Recommendations**: Provides actionable recommendations and treatments based on the AI's diagnosis.

### 3. Harvest Tracking & AI Learning
- **Historical Harvest Tracker**: Allows farmers to log and track yield data by crop, field, and season, recording environmental variables for future analysis.

### 4. Marketplace
- **Supplier-First Design**: A simple marketplace where farmers can list their produce for sale.
- **Filtering & Search**: Functionality to filter and search for produce based on location and transport needs.

---

## ⚙️ Technology Stack

**Frontend:**  
- Next.js (App Router)  
- Tailwind CSS  

**Backend & Database:**  
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)  

**AI & Integration:**  
- **AI Models**: Integrated with external AI models and APIs for image recognition and planning logic.  
- **External Data**: Leverages weather and soil data APIs for real-time insights.  
- **APIs**: Google Calendar API for task synchronization.

---

## 📈 Stretch Goals
- **Live Commodity Price Feed**: Integrate with a commodity price API to display local and global market prices.
- **Price Trend Analytics**: Provide simple analytics on commodity price trends to help with selling decisions.

---

## 🤝 How to Run the Project Locally

**Clone the repository:**
```bash
git clone https://github.com/[Your_GitHub_Username]/terrasense.git
cd terrasense

npm install

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
... (other API keys)

npm run dev
```
This project is licensed under the MIT License.


