import React from "react";

const Home = () => {

const styles = {

page:{
minHeight:"100vh",
fontFamily:"Inter, system-ui, sans-serif",
background:"#f8fafc",
color:"#111827"
},

/* HERO */

hero:{
position:"relative",
padding:"160px 20px 140px",
textAlign:"center",
background:"linear-gradient(120deg,#eef2ff,#f8fafc)",
overflow:"hidden"
},

heroTitle:{
fontSize:"clamp(3rem,6vw,4.5rem)",
fontFamily: "'Playfair Display', serif",
color: "#1e293b", 
fontWeight:"800",
letterSpacing:"-1px",
marginBottom:"20px"
},

heroSubtitle:{
fontSize:"1.25rem",
color:"#6b7280",
maxWidth:"700px",
margin:"0 auto 40px",
lineHeight:"1.7"
},

buttonRow:{
display:"flex",
gap:"16px",
justifyContent:"center",
flexWrap:"wrap"
},

primaryBtn:{
padding:"16px 36px",
borderRadius:"12px",
border:"none",
cursor:"pointer",
fontWeight:"600",
color:"#fff",
background:"linear-gradient(135deg,#2563eb,#6366f1)",
boxShadow:"0 15px 40px rgba(37,99,235,.35)",
transition:"all .25s"
},

secondaryBtn:{
padding:"16px 36px",
borderRadius:"12px",
border:"1px solid #e5e7eb",
cursor:"pointer",
fontWeight:"600",
background:"#fff",
transition:"all .25s"
},

/* FEATURES */

featuresSection:{
maxWidth:"1200px",
margin:"auto",
padding:"120px 20px"
},

sectionHeader:{
textAlign:"center",
marginBottom:"70px"
},

sectionTitle:{
fontSize:"2.5rem",
fontWeight:"700",
marginBottom:"10px"
},

sectionSubtitle:{
color:"#6b7280",
fontSize:"1.1rem"
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
gap:"28px"
},

card:{
padding:"32px",
borderRadius:"18px",
background:"rgba(255,255,255,0.75)",
backdropFilter:"blur(10px)",
border:"1px solid #e5e7eb",
transition:"all .25s",
boxShadow:"0 10px 30px rgba(0,0,0,.06)"
},

icon:{
fontSize:"2rem",
marginBottom:"16px"
},

cardTitle:{
fontWeight:"600",
fontSize:"1.25rem",
marginBottom:"10px"
},

cardText:{
color:"#6b7280",
lineHeight:"1.6"
},

/* CTA */

cta:{
marginTop:"120px",
padding:"120px 20px",
background:"linear-gradient(135deg,#111827,#1f2937)",
textAlign:"center"
},

ctaTitle:{
fontSize:"2.5rem",
color:"#fff",
fontWeight:"700",
marginBottom:"18px"
},

ctaText:{
color:"#d1d5db",
maxWidth:"600px",
margin:"auto",
marginBottom:"40px",
lineHeight:"1.7"
},

ctaBtn:{
padding:"18px 40px",
borderRadius:"12px",
border:"none",
background:"linear-gradient(135deg,#2563eb,#6366f1)",
color:"#fff",
fontWeight:"600",
cursor:"pointer",
boxShadow:"0 15px 40px rgba(37,99,235,.35)",
transition:"all .25s"
}

};

const features = [
{
icon:"🎯",
title:"Browse Destinations",
text:"Explore premium wedding destinations with curated venues and pricing."
},
{
icon:"📦",
title:"Custom Packages",
text:"Create personalized wedding packages tailored to your vision."
},
{
icon:"👥",
title:"Expert Vendors",
text:"Connect with photographers, decorators and planners."
},
{
icon:"📋",
title:"Planning Dashboard",
text:"Track your entire wedding planning progress in one place."
},
{
icon:"⭐",
title:"Reviews",
text:"Read verified reviews from real couples."
},
{
icon:"💬",
title:"Direct Chat",
text:"Communicate instantly with vendors and planners."
}
];

return (

<div style={styles.page}>

{/* HERO */}

<section style={styles.hero}>

<h1 style={styles.heroTitle}>
Plan Your Dream Destination Wedding
</h1>

<p style={styles.heroSubtitle}>
Everything you need to create a perfect wedding — venues,
vendors, packages and planning tools in one platform.
</p>

<div style={styles.buttonRow}>
<button style={styles.primaryBtn}>Get Started</button>
<button style={styles.secondaryBtn}>Explore Venues</button>
</div>

</section>


{/* FEATURES */}

<section style={styles.featuresSection}>

<div style={styles.sectionHeader}>
<h2 style={styles.sectionTitle}>Why Couples Choose Us</h2>
<p style={styles.sectionSubtitle}>
A modern platform built for seamless wedding planning
</p>
</div>

<div style={styles.grid}>

{features.map((f,i)=>(
<div
key={i}
style={styles.card}
onMouseEnter={e=>{
e.currentTarget.style.transform="translateY(-8px)";
e.currentTarget.style.boxShadow="0 20px 50px rgba(0,0,0,.15)";
}}
onMouseLeave={e=>{
e.currentTarget.style.transform="translateY(0)";
e.currentTarget.style.boxShadow="0 10px 30px rgba(0,0,0,.06)";
}}
>

<div style={styles.icon}>{f.icon}</div>
<h3 style={styles.cardTitle}>{f.title}</h3>
<p style={styles.cardText}>{f.text}</p>

</div>
))}

</div>

</section>


{/* CTA */}

<section style={styles.cta}>

<h2 style={styles.ctaTitle}>
Start Planning Today
</h2>

<p style={styles.ctaText}>
Join thousands of couples planning their dream weddings using
our platform.
</p>

<button style={styles.ctaBtn}>
Create Free Account
</button>

</section>

</div>

);
};

export default Home;