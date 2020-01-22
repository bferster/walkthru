// DOC /////////////////////////////////////////////////////////////////////////////////////////////////////////

class Doc {

	constructor()																								// CONSTRUCTOR
	{
	}

	Draw() 																										// DRAW
	{
	}

	
/// MANAGEMENT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	MakeTabFile()																							// MAKE TAB-DELINEATED FILE OF COURSE
	{
		var i,o;
		var str=makeTSVLine("type","id","name","parent","body");													// Add header
		this.IterateLobs((i,id)=> {																					// Iterate through list in order
			var o=this.lobs[i];																						// Point at lob
			str+=makeTSVLine("lob",o.id,o.name,o.parent,o.body);													// Add connected lob
			});		
		str+="\n";																									// Add blank line
		for (i=1;i<this.lobs.length;++i) {																			// For each lob	
			var o=this.lobs[i];																						// Point at lob
			if (!this.FindLobById(o.parent))																		// Not connected anywhere
				str+=makeTSVLine("lob",o.id,o.name,o.parent,o.body);												// Add un connected connected lob
			}
		str+="\n";																									// Add blank line
		for (i=0;i<app.rul.rules.length;++i) {																		// For each rule	
			var o=app.rul.rules[i];																					// Point at rule
			var s="IF "+o.subject+" "+o.verb+" "+o.trigger+" THEN "+o.do+" "+o.object;								// Remake text rule
			str+=makeTSVLine("rul",o.id,o.name,"",s);																// Add rule
			}
		str+="\n";																									// Add blank line
		for (i=0;i<app.doc.asks.length;++i) {																		// For each ask	
			var o=app.doc.asks[i];																					// Point at ask
			str+=makeTSVLine("ask",o.id,o.name,"",o.step);															// Add ask
			}
		str+="\n";																									// Add blank line
		for (i=0;i<app.ams.skins.length;++i) {																		// For each ams	
			var o=app.ams.skins[i];																					// Point at ams
			str+=makeTSVLine("ams",o.id,o.name,"",o.body);															// Add ams
			}
		for (i=0;i<app.doc.trans.length;++i) {																		// For each transcript	
			var o=app.doc.trans[i];																					// Point at transcript
			str+=makeTSVLine("tra",o.id,o.name,"",o.text);															// Add it
			}
		
		var s="assessLevel="+app.assessLevel;																		// Add assessment level
		if (!app.setDone) 		s+=" setDone";																		// Don't set done
		if (app.skipDone) 		s+=" skipDone";																		// Set skipping when done
		if (app.login) 			s+=" login";																		// Set login
		if (app.hideHeader) 	s+=" hideHeader";																	// Set hiding of header
		if (app.fullScreen) 	s+=" fullScreen";																	// Set init full
		if (app.toneJS) 		s+=" toneJS";																		// Set init toneJS lib
		if (app.reportLevel)	s+=" reportLevel="+app.reportLevel;													// Report level
		if (app.reportLink)		s+=" reportLink="+app.reportLink;													// Report link
		if (app.namePrefix)		s+=" namePrefix="+app.namePrefix;													// Username prefix
		if (app.defMargin)		s+=" margin="+app.defMargin;														// Default margin
		if (app.discussion)		s+="discussion="+app.discussion;													// Discussion link
		str+=makeTSVLine("set","","Settings","",s);																	// Add set

		function makeTSVLine(type, id, name, parent, body) {														// CREATE TSV OF LOB																				
			var s=type+"\t";																						// Save type
			s+=(id ? (""+id).replace(/(\n|\r|\t)/g,"") : "")+"\t";													// Id, remove CRs/LFs/TABs
			s+=(name ? (""+name).replace(/(\n|\r|\t)/g,"") : "")+"\t";												// Name 
			s+=(parent ? (""+parent).replace(/(\n|\r|\t)/g,"") : "")+"\t";											// Parent 
			s+=(body ? (""+body).replace(/(\n|\r|\t)/g,"") : "")+"\n";												// Body 
			return s;																								// Return TSV line
			}
		return str;																									// Return tab-delimited version
		}

/// MISC //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	UniqueLobId(id) 																							// MAKE UNIQUE LOB ID BASED ON PARENT
	{	
		var nid,add=1;																								// Add number																				
		nid=id+""+add;																								// Add number to parent
		while (this.FindLobById(nid))																				// While not unique
			nid=id+""+(++add);																						// Add to count until it is																					
		return nid;																									// Return unique id												
	}

	InitFromTSV(tsv)																							// INIT APP DATA FROM TSV FILE
	{
		var i,v;
		this.lobs=[];																								// Init lobs
		this.asks=[];																								// Init assessment
		this.trans=[];																								// Init transcripts
		app.rul.rules=[];																							// Init rules
		app.ams.skins=[];																							// Init skins
		tsv=tsv.replace(/\\r/,"");																					// Remove CRs
		tsv=tsv.split("\n");																						// Split into lines
		for (i=1;i<tsv.length;++i) {																				// For each line
			v=tsv[i].split("\t");																					// Split into fields
			if (v[0] == "lob") 																						// A lob
				this.lobs.push({ name:v[2], id:v[1], parent:v[3], body:v[4], status:0 });							// Add learning object
			else if (v[0] == "ask")																					// An assessment step
				this.asks.push({ id:v[1], name:v[2], step:v[4]});													// Add ask
			else if (v[0] == "ams")																					// An active media skin
				app.ams.AddSkin(v[1],v[2],v[4]);																	// Add skin
			else if (v[0] == "tra")																					// A transcript
				this.trans.push({ id:v[1], name:v[2], text:v[4]});													// Add transcript
			else if (v[0] == "rul")	{																				// A Rule
				var o={id:v[1], name:v[2] };																		// Base
				v[4]=v[4].replace(/ +/g," ");																		// Single space
				v=v[4].split(" ");																					// Split by space														
				if (v.length < 6)	continue;																		// Skip if now well formed
				o.subject=v[1];		o.verb=v[2];  	o.trigger=v[3];													// Left
				o.do=v[5];			o.object=v[6];																	// Right
				app.rul.rules.push(o);																				// Add step
				}
			else if (v[0] == "set")	{																				// A Setting
				if (v[4] && v[4].match(/login/i))			app.login=true;											// Force login
				if (v[4] && v[4].match(/setDone/i))			app.setDone=false;										// No status set
				if (v[4] && v[4].match(/skipDone/i))		app.skipDone=true;										// Skip if done
				if (v[4] && v[4].match(/hideHeader/i))		app.hideHeader=true;									// Hide header area
				if (v[4] && v[4].match(/toneJS/i))			app.toneJS=true;										// Init tone JS
				if (v[4] && v[4].match(/fullScreen/i))		app.fullScreen=true;									// Init full screen
				if (v[4] && v[4].match(/assessLevel=/i))	app.assessLevel=v[4].match(/assessLevel=(\.*\d+)/i)[1];	// Assessment pass level
				if (v[4] && v[4].match(/reportLevel=/i))	app.reportLevel=v[4].match(/reportLevel=(\.*\d+)/i)[1];	// Assessment reporting level
				if (v[4] && v[4].match(/reportLink=/i))		app.reportLink=v[4].match(/reportLink=(\.*\S+)/i)[1];	// Assessment reporting link
				if (v[4] && v[4].match(/namePrefix=/i))		app.namePrefix=v[4].match(/namePrefix=(\.*\S+)/i)[1];	// User name prefix
				if (v[4] && v[4].match(/margin=/i))			app.defMargin=v[4].match(/margin=(\.*\d+)/i)[1];		// Default margin
				if (v[4] && v[4].match(/discussion=/i))		app.discussion=v[4].match(/discussion=(\.*\S+)/i)[1];	// Discussion link
				}
			}
		if (!this.lobs.length)																						// No lobs defined
			this.lobs=[ { name:"Course name", id:1, status:0, body:"", children:[], kids:[]}];						// Add start Lob
		this.AddChildList();																						// Add children	
		app.Draw();																									// Reset data positions
		if (app.login)	GetTextBox("Please log in","Type your user name","",function(s) { app.userName=s} ); 		// Login
	}

	GDriveLoad(id) 																								// LOAD DOC FROM GOOGLE DRIVE
	{
		var _this=this;																								// Save context
		var str="https://docs.google.com/spreadsheets/d/"+id+"/export?format=tsv";									// Access tto
		var xhr=new XMLHttpRequest();																				// Ajax
		xhr.open("GET",str);																						// Set open url
		xhr.onload=function() { _this.InitFromTSV(xhr.responseText); };												// On successful load, init app from TSV file
		xhr.send();																									// Do it
		
		xhr.onreadystatechange=function(e) { 																		// ON AJAX STATE CHANGE
			if ((xhr.readyState === 4) && (xhr.status !== 200)) {  													// Ready, but no load
				Sound("delete");																					// Delete sound
				PopUp("<p style='color:#990000'><b>Couldn't load Google Doc!</b></p>Make sure that <i>anyone</i><br>can view it in Google",5000); // Popup warning
				}
			};		
		}
}																												// CLASS CLOSURE
	