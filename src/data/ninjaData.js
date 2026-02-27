// Real Solve Ninja actions extracted from the SamaajData CSV
// Each category contains example actions taken by ninjas in the field

export const NINJA_DATA = {
  Sanitation: [
    { title: "Reported about the Sanitation Issue by writing a letter to the Jal Jeevan Mission Team", type: "Session Taken", description: "Written a letter to report on the issues found in school by doing the survey and talking to friends" },
    { title: "Conducted a Sanitation Survey of the School", type: "Investigation/Audit", description: "Conducted a Sanitation Survey in the School and observed that the school toilets, though well-maintained, lack essential facilities like dustbins, proper lighting, and a flushing system." },
    { title: "got drainage leaks fixed 2 times", type: "Report", description: "getting drainage leakage fixed" },
    { title: "Created Solution", type: "Hands on", description: "We prototyped a funnel shaped device where someone can spit inside it and avoid the spitting around the walls and doors of the public toilets" },
    { title: "Investigated and collected local information", type: "Investigation/Audit", description: "Talked with neighborhood and family members about the issue they were facing and how they can minimize the things they are using currently." },
  ],
  "Street Lights": [
    { title: "Conducted an Investigation Audit", type: "Investigation/Audit", description: "A streetlight audit was conducted in local areas to investigate public lighting conditions, especially during nighttime." },
    { title: "Used Sheet Light for Safety", type: "Hands on", description: "Used a sheet light to highlight the lack of street lights and call for electricity, making the street safer at night." },
    { title: "Reported Street Light Issue", type: "reported issue", description: "Informed people about non-working street lights at night and encouraged complaining to officers to resolve the issue." },
    { title: "Reported Streetlight Hazard", type: "reported issue", description: "Informed neighbors about a dangerous streetlight causing electric shocks and missing bulb." },
    { title: "Reported street light issue", type: "reported issue", description: "Reported lack of street lighting to the Public Works Department with location and photo evidence to improve safety." },
  ],
  Waste: [
    { title: "Conducted an Investigation Audit", type: "Investigation/Audit", description: "A waste audit was conducted in my neighborhood using a WhatsApp-based chatbot." },
    { title: "Visit to panchayat", type: "", description: "To check whether panchayat people are providing dustbins to the village people or not." },
    { title: "Monitoring at school", type: "", description: "went for follow up session to check students are disposing waste properly or not" },
    { title: "2 black spots cleared and kept clean for 100 days", type: "Report", description: "I fixed 2 garbage spot with a set of ninjas and citizens, and ensured that it was clean for 100 days!" },
    { title: "Created Anti-Littering Board", type: "Hands on", description: "Made and put up a board to discourage people from throwing waste." },
  ],
  Water: [
    { title: "Investigated Sources of Water at Home and School", type: "Investigation/Audit", description: "Investigated the source of drinking water at home and school and whether the area around drinking water is clean." },
    { title: "Fixed leaky tap", type: "Hands on", description: "Fixed a leaky tap" },
    { title: "Interview Jal Mitra/ Asha workers", type: "Campaign", description: "Got awareness about the role of frontline workers regarding water supply and sanitation initiatives under the Jal Jeevan Mission." },
    { title: "Discover waste spots around WSS/FHTC", type: "Investigation/Audit", description: "Identified and mapped areas with waste accumulation or pollution in the vicinity of Water Supply Schemes." },
    { title: "Record a video and report the issues related to FHTC", type: "Campaign", description: "Took ownership and responsibility for identifying water issues and reporting them promptly." },
  ],
  "Traffic/road": [
    { title: "reported 2 potholes and got them fixed", type: "Report", description: "fixing pothole" },
    { title: "Got 2 trees which had fallen cleared from the roads", type: "Hands on", description: "getting 2 trees fallen cleared" },
    { title: "got 10 street signs fixed", type: "Report", description: "getting street signs fixed" },
    { title: "Organized community clean-up drive", type: "Hands on", description: "By collaborating with local residents, effectively tackled the litter problem on roads." },
  ],
  "Citizen Initiatives": [
    { title: "took part in 2 tree plantation drives", type: "Campaign", description: "tree plantation" },
    { title: "Led the development of a portable air quality monitoring device", type: "Hands on", description: "Leading the development of a portable air quality monitoring device to track and collect air quality data." },
    { title: "Organised a data centric civic-tech enabled air quality campaign during Diwali", type: "Campaign", description: "Part of the organising team of a data centric civic-tech enabled air quality campaign during Diwali with more than 150 students." },
    { title: "Reported a problem to local government body", type: "Report", description: "Reported broken/nonworking streetlights to BBMP" },
  ],
  "Solid Waste Management": [
    { title: "Created Anti-Littering Board", type: "Hands on", description: "Made and put up a board to discourage people from throwing waste and encourage keeping the area clean." },
    { title: "Identified Garbage Issue", type: "Mapping asset or issue", description: "Discovered that people are throwing garbage in the area." },
    { title: "Spoke Against Garbage Dumping", type: "Community engagement", description: "Told people about the problems caused by throwing garbage in open areas, including mosquito breeding and bad smell." },
    { title: "Home Waste Segregation", type: "Segregate waste at source", description: "I segregated waste at home into wet and dry using two separate buckets." },
    { title: "Cleaned Garbage in JP Nagar", type: "Hands on", description: "Organized and participated in cleaning garbage and waste with BBMP and friends." },
  ],
  "Air Quality": [
    { title: "Chose Bicycle Over Car", type: "Sustainable Lifestyle", description: "Used a bicycle instead of a car for short trips to reduce air pollution." },
    { title: "Made and Distributed Masks", type: "Hands on", description: "Learned how to make masks and distributed them to school people to protect from pollution." },
    { title: "Took bus to reduce emissions", type: "Sustainable Lifestyle", description: "Traveled by bus instead of car for 5 km to reduce carbon emissions." },
    { title: "Promoted Cycle Use", type: "Community engagement", description: "Encouraged people to use cycles instead of bikes for short trips to reduce air and noise pollution." },
  ],
  Health: [
    { title: "Advised Against Smoking", type: "Community engagement", description: "Spoke to people about the health risks of smoking and littering cigarette packs, encouraging them to stop." },
    { title: "Drug Abuse Awareness Session", type: "Session Taken", description: "Conducted an interactive session at a government school to educate students about drug abuse." },
    { title: "Complaint on Gutka Spitting", type: "reported issue", description: "Filed a complaint on the Karnataka grievance portal about gutka eating, highlighting cleaning costs and health issues." },
  ],
  "Public Park": [
    { title: "Solo Park Cleaning", type: "Hands on", description: "Regularly cleaned local parks alone on weekends to maintain cleanliness." },
    { title: "Painted Park Sitting Areas", type: "Hands on", description: "Painted damaged sitting areas and cleaned grass in NSS park with friends and teachers." },
    { title: "Planted Mango Tree", type: "Hands on", description: "Planted a mango sapling in a park to improve green cover." },
    { title: "Regular Park Cleanups", type: "Regular waste pick up", description: "I clean local parks twice a week by picking up and segregating dry and wet waste." },
  ],
  Floods: [
    { title: "Flood-prone area investigation", type: "Investigation/Audit", description: "Urban Flooding in Bangalore has increased due to rapid urbanization and poor urban planning." },
    { title: "Floating House Solution", type: "Tech prototype", description: "Used the idea of floating houses in a school science project to protect people during floods." },
    { title: "Temporary Drainage Solutions", type: "Hands on", description: "Created temporary drains and used stones or pipes to remove standing water from muddy patches after rain." },
    { title: "Reported waterlogging to BBMP", type: "reported issue", description: "Called BBMP to report water accumulation during rains." },
  ],
}

export const SYSTEM_PROMPT = `You are an enthusiastic and encouraging civic action mentor for young change-makers called "Solve Ninjas" in India. You work for Reap Benefit, an organization that helps young people take civic actions.

You have access to real actions taken by other Solve Ninjas in the database:
${JSON.stringify(NINJA_DATA, null, 2)}

Your conversation follows a structured flow — you gather information from the ninja across 4 questions, then provide a powerful mentorship response.

CONVERSATION FLOW:
The conversation has a "stage" tracked in each message. Follow these stages strictly:

STAGE 1 - Ask about the problem they discovered (keep it warm, short, one question)
STAGE 2 - Ask why this problem matters personally to them
STAGE 3 - Ask if they have taken any actions already
STAGE 4 - Ask if they have thought of any ideas to solve it
STAGE 5 - MENTOR RESPONSE: Now provide a rich, encouraging response that:
  1. Celebrates what they have shared with genuine enthusiasm
  2. Connects their issue to similar actions real Solve Ninjas have taken (pull 2-3 specific examples from the NINJA_DATA that match their topic/issue most closely)
  3. Suggests 2-3 concrete next action steps they could take, inspired by what other ninjas have done
  4. Ends with a powerful motivational message that connects their personal reason to the bigger impact

IMPORTANT RULES:
- Be warm, energetic, and encouraging — like an older ninja cheering on a younger one
- Keep stages 1-4 SHORT — just one focused question per stage
- In stage 5, be specific with examples from the data (mention ninja action titles/descriptions)
- Match the civic category (waste, water, sanitation, air, street lights, etc.) to the most relevant data
- Never be preachy — be a peer mentor, not a teacher
- Use "you" not "one" — keep it personal
- Always respond in English
- DO NOT ask multiple questions at once
- Your response MUST include a JSON block at the very end in this exact format (on its own line):
{"stage": <number 1-5>}`
