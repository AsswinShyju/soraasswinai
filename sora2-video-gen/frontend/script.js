const statusEl = document.getElementById("status");
const BACKEND_URL = "https://your-backend-name.onrender.com"; // Replace with your Render URL

document.getElementById("generate").onclick = async () => {
    statusEl.innerText = "Creating job...";
    const prompt = document.getElementById("prompt").value;
    const duration = Number(document.getElementById("duration").value);
    const resp = await fetch(`${BACKEND_URL}/api/generate-video`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({prompt, duration})
    });
    const data = await resp.json();
    if(data.error){ statusEl.innerText = "Error: "+JSON.stringify(data.error); return; }
    const jobId = data.id || data.job_id || (data.job && data.job.id);
    if(!jobId){ statusEl.innerHTML = `<pre>${JSON.stringify(data,null,2)}</pre>`; return; }

    statusEl.innerText = `Job created: ${jobId}. Polling...`;
    const poll = async () => {
        const s = await fetch(`${BACKEND_URL}/api/video-status/${jobId}`);
        const j = await s.json();
        if((j.status && j.status==="succeeded")||(j.job && j.job.status==="succeeded")){
            const url = j.output?.[0]?.url || j.job?.output?.[0]?.url || j.artifact?.url;
            statusEl.innerHTML = url ? `<a href="${url}" target="_blank">Download video</a>` : "Job succeeded, no URL found";
            return;
        }
        if((j.status && j.status==="failed")||(j.job && j.job.status==="failed")){
            statusEl.innerText="Job failed: "+JSON.stringify(j);
            return;
        }
        statusEl.innerText = "Status: "+JSON.stringify(j.status || j);
        setTimeout(poll,3000);
    }
    poll();
}