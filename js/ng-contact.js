	var ng = ng || {};
	ng.contact = ng.contact || {};		

	//call the method for get the contact and group
	ng.contact.getData = function(callback){
		ng.contact.fetchContactList(callback);
		ng.contact.fetchGroupList(callback);
	};

	//get the token
	ng.contact.getToken = function(callback) {
		var callbackData = function(){
			ng.contact.getData(callback);
		}

		ng.core.oauth.authorize(function() {
			var url = "http://www.google.com/m8/feeds";
			ng.core.oauth.sendSignedRequest(url, callbackData, {});
		});
	};

	//get group
	ng.contact.fetchGroupList = function(callback) {
		var callbackData = function(text,xhr){
			onGroups(text,xhr,callback);
		}

		ng.core.oauth.authorize(function() {
			var url = "http://www.google.com/m8/feeds/groups/default/full";
			ng.core.oauth.sendSignedRequest(url, callbackData, {
				'parameters' : {
					'alt' : 'json',
					'max-results' : 100
				}
			});
		});
	};

	//get contact
	ng.contact.fetchContactList = function(callback) {
		var callbackData = function(text,xhr){
			onContacts(text,xhr,callback);
		}

		ng.core.oauth.authorize(function() {
			var url = "http://www.google.com/m8/feeds/contacts/default/full";
			ng.core.oauth.sendSignedRequest(url, callbackData, {
				'parameters' : {
					'alt' : 'json',
					'max-results' : 100
				}
			});
		});
	};
	
	// ------ create contact ------ //
	ng.contact.createContact = function(data,callback) {
		var callbackData = function(resp, xhr){
			createCallback(resp, xhr, callback);
		}
		var url = 'http://www.google.com/m8/feeds/contacts/default/full';
		var bodyXmlEntry = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005"><atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/contact/2008#contact" />'
		if(data.name){
			bodyXmlEntry = bodyXmlEntry + '<gd:name><gd:fullName>'+data.name+'</gd:fullName></gd:name>';
		}
		if(data.phone){
			bodyXmlEntry = bodyXmlEntry + '<gd:phoneNumber rel="http://schemas.google.com/g/2005#work" primary="true">'+data.phone+'</gd:phoneNumber>';
		}
		if(data.emails){
			for(var i=0;i<data.emails.length;i++){
				if(i == 0){
					bodyXmlEntry = bodyXmlEntry + '<gd:email rel="http://schemas.google.com/g/2005#work" primary="true" address="'+data.emails[i]+'"/>';
				}else if(i == 1){
					bodyXmlEntry = bodyXmlEntry + '<gd:email rel="http://schemas.google.com/g/2005#home"  address="'+data.emails[i]+'"/>';
				}	
			}
		}
		
		bodyXmlEntry = bodyXmlEntry + '</atom:entry>';
		var request = {
		    'method': 'POST',
		    'headers': {
		      'GData-Version': '3.0',
		      'Content-Type': 'application/atom+xml'
		    },
		    'parameters': {
		      'alt': 'json'
		    },
		    'body': bodyXmlEntry
		  };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	
	function createCallback(resp, xhr, callback) {
		//localStorage.setItem("resp",resp);
		ng.contact.fetchContactList(callback);
	};
	// ------ /create contact ------ //
	
	// ------ delete contact ------ //
	ng.contact.deleteContact = function(editLink,callback) {
		//localStorage.setItem("editLink",editLink);
		var callbackData = function(resp, xhr){
			deleteCallback(resp, xhr,callback);
		}
		var url = editLink;
		var request = {
		    'method': 'POST',
		    'headers': {
		      'X-HTTP-Method-Override': 'DELETE',
		      'Content-Type': 'application/atom+xml'
		    }
		  };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	function deleteCallback(resp, xhr, callback) {
		//localStorage.setItem("deleteStatu",xhr.status);
		ng.contact.fetchContactList(callback);
	};
	// ------ /delete contact ------ //
	
	// ------ update contact ------ // 
	ng.contact.updateContact = function(editLink, selfLink, data, callback) {
		//localStorage.setItem("selfLink",selfLink);
		//localStorage.setItem("editLink",editLink);
		var callbackData = function(resp, xhr){
			getContactCallback(resp, xhr, editLink, data, callback);
		}
		var url = selfLink;
		var request = {
		    'method': 'GET',
		    'headers': {
				'Content-Type': 'application/atom+xml'
		    }
		 };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	
	function getContactCallback(resp, xhr, editLink, data, callback) {
		//localStorage.setItem("getStatu",xhr.status);
		var xmldoc = xhr.responseXML;
		xmldoc.getElementsByTagName("title")[0].firstChild.nodeValue = data.name;
		//xmldoc.getElementsByTagName("gd:phoneNumber")[0].firstChild.nodeValue = data.phone;
		//xmldoc.getElementsByTagName("gd:postalAddress")[0].firstChild.nodeValue = data.address;
		
		var callbackData = function(resp, xhr){
			updateContactCallback(resp, xhr, callback);
		}
		
		var url = editLink;
		var request = {
		    'method': 'PUT',
		    'headers': {
				'Content-Type': 'application/atom+xml'
		    },
		    'body': xmldoc
		 };
		ng.core.oauth.sendSignedRequest(url, callbackData, request);		
	};
	
	function updateContactCallback(resp, xhr, callback) {
		//localStorage.setItem("updateStatu",xhr.status);
		ng.contact.fetchContactList(callback);
	};
	// ------ /update contact ------ // 
	
	// ------ create group ------ // 
	ng.contact.createGroup = function(data,callback) {
		var callbackData = function(resp, xhr){
			createGroupCallback(resp, xhr, callback);
		}
		var url = 'http://www.google.com/m8/feeds/groups/default/full';
		var bodyXmlEntry = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005"><atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/contact/2008#group" />'
		if(data.name){
			bodyXmlEntry = bodyXmlEntry + '<atom:title type="text">'+data.name+'</atom:title><atom:content type="text">'+data.name+'</atom:content>';
		}
		bodyXmlEntry = bodyXmlEntry + '</atom:entry>';
		//localStorage.setItem("bodyXmlEntry",bodyXmlEntry);
		var request = {
		    'method': 'POST',
		    'headers': {
		      'GData-Version': '3.0',
		      'Content-Type': 'application/atom+xml'
		    },
		    'parameters': {
		      'alt': 'json'
		    },
		    'body': bodyXmlEntry
		  };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	
	function createGroupCallback(resp, xhr, callback) {
		//localStorage.setItem("createGroup xhr.status",xhr.status); 
		ng.contact.fetchGroupList(callback);
	};
	// ------ /create group ------ // 
	
	// ------ delete group ------ // 
	ng.contact.deleteGroup = function(editLink,callback) {
		//localStorage.setItem("editLink",editLink);
		var callbackData = function(resp, xhr){
			deleteGroupCallback(resp, xhr,callback);
		}
		var url = editLink;
		var request = {
		    'method': 'POST',
		    'headers': {
		      'X-HTTP-Method-Override': 'DELETE',
		      'Content-Type': 'application/atom+xml'
		    }
		  };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	function deleteGroupCallback(resp, xhr, callback) {
		//localStorage.setItem("deleteStatu",xhr.status);
		ng.contact.fetchGroupList(callback);
	};
	// ------ /delete group ------ // 
	
	// ------ update group ------ // 
	ng.contact.updateGroup = function(editLink, data, callback) {
		//localStorage.setItem("editLink",editLink);
		var callbackData = function(resp, xhr){
			getGroupCallback(resp, xhr, editLink, data, callback);
		}
		var url = data.id;
		var request = {
		    'method': 'GET',
		    'headers': {
				'Content-Type': 'application/atom+xml'
		    }
		 };

		ng.core.oauth.sendSignedRequest(url, callbackData, request);
	};
	
	function getGroupCallback(resp, xhr, editLink, data, callback) {
		//localStorage.setItem("getStatu",xhr.status);
		var xmldoc = xhr.responseXML;
		xmldoc.getElementsByTagName("title")[0].firstChild.nodeValue = data.name;
		xmldoc.getElementsByTagName("content")[0].firstChild.nodeValue = data.name;
		
		var callbackData = function(resp, xhr){
			updateGroupCallback(resp, xhr, callback);
		}
		
		var url = editLink;
		var request = {
		    'method': 'PUT',
		    'headers': {
				'Content-Type': 'application/atom+xml'
		    },
		    'body': xmldoc
		 };
		ng.core.oauth.sendSignedRequest(url, callbackData, request);		
	};
	
	function updateGroupCallback(resp, xhr, callback) {
		//localStorage.setItem("updateStatu",xhr.status);
		ng.contact.fetchGroupList(callback);
	};
	// ------ /update group ------ // 
	
	
	// ------ callback for get contact and group ------ // 
	var contacts = null;
	var groups = null;
	var groupcontact = null;
	var hasGetContactsData = false;
	var hasGetGroupsData = false;

	function onContacts(text, xhr,callback) {
		//localStorage.setItem("onContacts",text); 
		var contacts = [];
		var groupcontact = [];
		var data = JSON.parse(text);
		for (var i = 0, entry; entry = data.feed.entry[i]; i++) {
			var contact = {
				'name' : entry['title']['$t'],
				'id' : entry['id']['$t'],
				'emails' : [],
				'editLink' : '',
				'selfLink' : '',
				//'groupIds' : [],
				'phone' : [],
				'address' : []
			};

			if (entry['gd$email']) {
				var emails = entry['gd$email'];
				for (var j = 0, email; email = emails[j]; j++) {
					contact['emails'].push(email['address']);
				}
			 }

			if (!contact['name']) {
				contact['name'] = contact['emails'][0] || "<Unknown>";
			}
			
			if (entry['gContact$groupMembershipInfo']) {
				var groupIds = entry['gContact$groupMembershipInfo'];
				for (var m = 0, groupId; groupId = groupIds[m]; m++) {
					//contact['groupIds'].push(groupId['href']);
					var groupContactData = [];
					groupContactData.push(groupId['href']);
					groupContactData.push(contact['id']);
					groupcontact.push(groupContactData);
				}
			}
			
			if (entry['gd$phoneNumber']) {
				var phoneNumbers = entry['gd$phoneNumber'];
				for (var m = 0, phoneNumber; phoneNumber = phoneNumbers[m]; m++) {
					contact['phone'].push(phoneNumber['$t']);
				}
			}
			
			if (entry['gd$postalAddress']) {
				var postalAddress = entry['gd$postalAddress'];
				for (var m = 0, pAddress; pAddress = postalAddress[m]; m++) {
					contact['address'].push(pAddress['$t']);
				}
			}
			
			if (entry['link']) {
				var links = entry['link'];
				for (var n = 0, link; link = links[n]; n++) {
					if(link['rel'] == "edit"){
						contact['editLink'] = link['href'];
					}
					if(link['rel'] == "self"){
						contact['selfLink'] = link['href'];
					}
				}
			 }

			contacts.push(contact);
  
			
		}
		localStorage.groupcontact = JSON.stringify(groupcontact);
		
		localStorage.contacts = JSON.stringify(contacts);

		hasGetContactsData = true;
		if(hasGetContactsData && hasGetGroupsData){
  			if(callback){
				callback();
			}
		}
	};

	function onGroups(text, xhr,callback) {
		//localStorage.setItem("onGroups",text); 
		groups = [];
		var data = JSON.parse(text);
		for (var i = 0, entry; entry = data.feed.entry[i]; i++) {
			var group = {
				'name' : entry['title']['$t'],
				'id' : entry['id']['$t']
			};
			
			if (entry['link']) {
				var links = entry['link'];
				for (var n = 0, link; link = links[n]; n++) {
					if(link['rel'] == "edit"){
						group['editLink'] = link['href'];
						break;
					}
				}
			 }

			groups.push(group);
			
		}
		
		localStorage.groups = JSON.stringify(groups);

		hasGetGroupsData = true;
		if(hasGetContactsData && hasGetGroupsData){
  			if(callback){
				callback();
			}
		}
	};			
	// ------ /callback for get contact and group ------ // 

			

			

			