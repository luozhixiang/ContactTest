var _SQLiteDb;
var daoCallBackEventListeners = {};
var hasSyngoogleToSQLite = false;
$(function(){
	// sqlit database connection
	var databaseOptions = {
			fileName: "sqlitecontacttest",
			version: "1.0",
			displayName: "SQLite Contact Test",
			maxSize: 1024
		};
	_SQLiteDb = openDatabase(
			databaseOptions.fileName,
			databaseOptions.version,
			databaseOptions.displayName,
			databaseOptions.maxSize
		);		
	brite.registerDao("Groups",new brite.dao.SQLiteDao("Groups","id",[{column:'google_gid',dtype:'TEXT'},{column:'name',dtype:'TEXT'}]));
	brite.registerDao("Users",new brite.dao.SQLiteDao("Users","id",[{column:'google_uid',dtype:'TEXT'},{column:'name',dtype:'TEXT'},{column:'email',dtype:'TEXT'},{column:'pno',dtype:'TEXT'}]));	
	brite.registerDao("GroupUser",new brite.dao.SQLiteDao("GroupUser","id",[{column:'group_id',dtype:'INTEGER'},{column:'user_id',dtype:'INTEGER'}]));
	brite.registerDao("GoogleContact",new brite.dao.GoogleContactDao());
	brite.registerDao("GoogleGroup",new brite.dao.GoogleGroupDao());
	brite.registerDao("GoogleGroupContact",new brite.dao.GoogleGroupContactDao());
	
	initData();
	
	$("#location-index").click(function(){
		refreshIndexDiv();
	});
	
	if(ng.daos.hasToken()){
		$("#location-login").hide();
		$("#location-logoff").show();
	}
	
	$("#location-login").click(function(){
		ng.daos.getToken(function(){
			$("#location-login").hide();
			$("#location-logoff").show();
		});
	});
	
	$("#location-logoff").click(function(){
		ng.daos.logOut();
		$("#location-login").show();
		$("#location-logoff").hide();
	});
	
});
function initData(){
	var dfd1 = brite.dm.remove("Users");
	var dfd2 = brite.dm.remove("Groups");	
	var dfd3 = brite.dm.remove("GroupUser");
	localStorage.removeItem("hasSyngoogleToSQLite"); 
//	var dfd4 =brite.dm.create("Users",{email:"001@a.com",name:"Mike1",pno:"123456"});
//	var dfd5 =brite.dm.create("Users",{email:"002@a.com",name:"Mike2",pno:"123456"});
//	var dfd6 =brite.dm.create("Users",{email:"003@a.com",name:"Mike3",pno:"123456"});
//	var dfd7 =brite.dm.create("Users",{email:"004@a.com",name:"Mike4",pno:"123456"});
//	var dfd8 =brite.dm.create("Users",{email:"005@a.com",name:"Mike5",pno:"123456"});
//		
//	var dfd9 =brite.dm.create("Groups",{name:"group1"});
//	var dfd10 =brite.dm.create("Groups",{name:"group2"});
	refreshIndexDiv();
//	$.when(dfd1,dfd2,dfd3).done(function(){
//		brite.addDataChangeListener("Users",function(daoChangeEvent){
//			refreshUserListDiv();
//		});
//		brite.addDataChangeListener("Groups",function(daoChangeEvent){
//			refreshGroupListDiv();
//		});
//	});
	
}
function parseRows2Json(rows){
	var json = [];
	var rlen = rows.length;
	for(var i=0;i<rlen;i++){
		json.push(rows.item(i));
	}
	return json;
}
//  --reload user list --//
function refreshUserListDiv(groupid){
	$('body').data('groupid',groupid);
	$("#location-index").show();
	$("#location-user").show();
	$("#location-group").hide();
	if(groupid){
		brite.dm.list("GroupUser",{matchs:{group_id:groupid}}).done(function(userGroupList){
			brite.dm.list("Users").done(function(userList){
                var users = [];
				for(var k in userList){											
					if(isInUserList(userGroupList,userList[k])){
						users.push(userList[k]);
					}											
				}
				brite.display('UserComponent',users);
			});		
		});
	}else{
		brite.dm.list("Users").done(function(results){
			brite.display('UserComponent',results);
		});
	}
}
//-- reload group list--//
function refreshGroupListDiv(){	
	brite.dm.list("Groups").done(function(results){
		$("#location-index").show();
		$("#location-user").hide();
		$("#location-group").show();
		brite.display('GroupComponent',results);	
	});
}

function refreshUserGroupListDiv(){	
	brite.dm.list("Groups").done(function(results){
		brite.display('GroupUserComponent',results);	
	});
	
}

function refreshIndexDiv(){
	$("#location-index").show();
	$("#location-user").hide();
	$("#location-group").hide();
	$("#locationMenuLt").empty();
	brite.display('IndexComponent',{});	
}

// -- check the check box status--//
function isInGroupList(list,obj){
	var glen = list.length;
	for(var i=0;i<glen;i++){
		if(list[i].group_id==obj.id){
			return true;
		}		
	}
	return false;
}

function isInUserList(list,obj){
	var glen = list.length;
	for(var i=0;i<glen;i++){
		if(list[i].user_id==obj.id){
			return true;
		}		
	}
	return false;
}

function isInGroupArray(list,obj){
	var glen = list.length;
	for(var i=0;i<glen;i++){
		if(list[i]==obj.id){
			return true;
		}		
	}
	return false;
}


function parseUser2Json(user,userGroups){
	var userJson = {};
	userJson.groups = userGroups;
	userJson.id = user.id;
	userJson.name = user.name;
	userJson.email = user.email;
	userJson.pno = user.pno;
	return userJson;
}

function getUserAndGroups(u){
    var dfd = $.Deferred();
	brite.dm.list("GroupUser",{matchs:{user_id:u.id}}).done(function(userGroupList){
		brite.dm.list("Groups").done(function(groupList){
			var gnames = "";
			for(var k in groupList){											
				if(isInGroupList(userGroupList,groupList[k])){
					gnames+= gnames==""?groupList[k].name:","+groupList[k].name;
				}											
			}
			gnames = gnames==""?null:gnames;
			u.groups = gnames;
			dfd.resolve(u);
		});
    });
    return dfd.promise();
}

function getArraystr(arr){
	var str = "";
	for(var e in arr){
		str+= "," + arr[e];
	}
	return str==""? "" : str.substring(1);
}

function synGoogledataToSQLite(divtype){
	var flag = ng.daos.hasToken();
	var hasSyngoogleToSQLite = localStorage.hasSyngoogleToSQLite;
	if(flag){
		if( typeof hasSyngoogleToSQLite =="undefined"){
			brite.dm.remove("Users").done(function(){
				brite.dm.remove("Groups").done(function(){
					brite.dm.remove("GroupUser").done(function(){
						$.when(synGoogleContacts(),synGoogleGroups()).done(function(){
							synGoogleContactGroup().done(function(){
								localStorage.setItem("hasSyngoogleToSQLite",true); 
								if(divtype){
									refreshGroupListDiv()
								}else{
									refreshUserGroupListDiv();
									refreshUserListDiv();
								}
							});
						});
					});		
				});
			});
		}
	}else{
        alert("You should login first!");
	}
}


function synGoogleContacts(){
	var dfd = $.Deferred();
	brite.dm.list("GoogleContact").done(function(GoogleContacts){
		var len = GoogleContacts.length;
		var createdcount = 0;
		if(len==0){
			dfd.resolve();
		}else{
			for(var g in GoogleContacts){
				var userJson = {};
				userJson.google_uid = GoogleContacts[g].id;
				userJson.name = GoogleContacts[g].name;
				userJson.email = getArraystr(GoogleContacts[g].emails);
				userJson.pno = getArraystr(GoogleContacts[g].phone);
				brite.dm.create("Users",userJson).done(function(){
					createdcount++;
					if(createdcount==len) dfd.resolve();
				});
			}	
		}
	});	
	return dfd.promise();
}

function synGoogleGroups(){
	var dfd = $.Deferred();
	brite.dm.list("GoogleGroup").done(function(GoogleGroups){
		var len = GoogleGroups.length;
		var createdcount = 0;
		if(len==0){
			dfd.resolve();
		}else{
			for(var g in GoogleGroups){
				var groupJson = {};
				groupJson.google_gid = GoogleGroups[g].id;
				groupJson.name = GoogleGroups[g].name;
				brite.dm.create("Groups",groupJson).done(function(){
					createdcount++;
					if(createdcount==len) dfd.resolve();
				});
			}	
		}
	});	
	return dfd.promise();
}

function synGoogleContactGroup(){
	var dfd = $.Deferred();
	brite.dm.list("GoogleGroupContact").done(function(GroupContacts){
		var len = GroupContacts.length;
		var createdcount = 0;
		if(len==0){
			dfd.resolve();
		}else{
			for(var g in GroupContacts){
				creatGroupUserByGoogleContactGroup(GroupContacts[g]).done(function(){
					createdcount++;
					if(createdcount==len) dfd.resolve();
				});
			}	
		}
	});	
	return dfd.promise();
}

function creatGroupUserByGoogleContactGroup(GroupContact){
	var dfd = $.Deferred();
	brite.dm.list("Users",{matchs:{google_uid:GroupContact[1]}}).done(function(userList){
		brite.dm.list("Groups",{matchs:{google_gid:GroupContact[0]}}).done(function(groupList){
			brite.dm.create("GroupUser",{group_id:groupList[0].id,user_id:userList[0].id}).done(function(){
				dfd.resolve();
			});
		});
	});
	return dfd.promise();
}