const key = "AIzaSyC4b92avh3ZC-o-p4pqZ_22ERNb-WP3cqs";

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).filter(n => n.includes("gemini")));
  } catch (err) {
    console.error(err);
  }
}

run();
