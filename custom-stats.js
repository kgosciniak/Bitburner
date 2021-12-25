/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script will enhance your HUD (Heads up Display) with custom statistics.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }
    
    const doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');
    while (true) {
        try {
            const headers = []
            const values = [];
            // Add script income per second
            headers.push("ScrInc");
            var num = ns.getScriptIncome()[0];
            if (num >= 1000000000) {
                values.push('$' + (num / 1000000000).toFixed(3).replace(/\.0$/, '') + 'b/s');
            }
            else if (num >= 1000000) {
                values.push('$' + (num / 1000000).toFixed(2).replace(/\.0$/, '') + 'm/s');
            }
            else if (num >= 1000) {
                values.push('$' + (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k/s');
            }
            else {
                values.push('$' + num + '/s');
            }            
            //values.push(ns.getScriptIncome()[0].toPrecision(5) + '/sec');
            // Add script exp gain rate per second
            headers.push("ScrExp");
            num = ns.getScriptExpGain();
            if (num >= 1000000000) {
                values.push((num / 1000000000).toFixed(3).replace(/\.0$/, '') + 'b/s');
            }
            else if (num >= 1000000) {
                values.push((num / 1000000).toFixed(2).replace(/\.0$/, '') + 'm/s');
            }
            else if (num >= 1000) {
                values.push((num / 1000).toFixed(1).replace(/\.0$/, '') + 'k/s');
            }
            else {
                values.push(num.toFixed(4).replace(/\.0$/, '') + '/s');
            }
            //values.push(ns.getScriptExpGain().toPrecision(5) + '/sec');
            // TODO: Add more neat stuff
            const karma = ns.heart.break();
            headers.push("Karma");
            values.push(karma);
            // Now drop it into the placeholder elements
            hook0.innerText = headers.join(" \n");
            hook1.innerText = values.join("\n");
        } catch (err) { // This might come in handy later
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }
}
