var _SQLiteDb;
var daoCallBackEventListeners = {};
$(function(){
	// sqlit database connection
	var databaseOptions = {
			fileName: "sqlite_contacttest",
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
	brite.registerDao("Groups",new brite.dao.SQLiteDao("Groups","id",[{column:'name',dtype:'TEXT'}]));
	brite.registerDao("Users",new brite.dao.SQLiteDao("Users","id",[{column:'name',dtype:'TEXT'},{column:'email',dtype:'TEXT'},{column:'pno',dtype:'TEXT'}]));	
	brite.registerDao("GroupUser",new brite.dao.SQLiteDao("GroupUser","id",[{column:'group_id',dtype:'INTEGER'},{column:'user_id',dtype:'INTEGER'}]));
	
	initData();
	
	$("#location-index").click(function(){
		refreshIndexDiv();
	});
	
});
function initData(){
	var dfd1 = brite.dm.remove("Users");
	var dfd2 = brite.dm.remove("Groups");	
	var dfd3 = brite.dm.remove("GroupUser");
			
	var dfd4 =brite.dm.create("Users",{email:"001@a.com",name:"Mike1",pno:"123456"});
	var dfd5 =brite.dm.create("Users",{email:"002@a.com",name:"Mike2",pno:"123456"});
	var dfd6 =brite.dm.create("Users",{email:"003@a.com",name:"Mike3",pno:"123456"});
	var dfd7 =brite.dm.create("Users",{email:"004@a.com",name:"Mike4",pno:"123456"});
	var dfd8 =brite.dm.create("Users",{email:"005@a.com",name:"Mike5",pno:"123456"});
		
	var dfd9 =brite.dm.create("Groups",{name:"group1"});
	var dfd10 =brite.dm.create("Groups",{name:"group2"});
	refreshIndexDiv();
	$.when(dfd1,dfd2,dfd3,dfd4,dfd5,dfd6,dfd7,dfd8,dfd9,dfd10).done(function(){
		brite.addDataChangeListener("Users",function(daoChangeEvent){
			refreshUserListDiv();
		});
		brite.addDataChangeListener("Groups",function(daoChangeEvent){
			refreshGroupListDiv();
		});
	});
	
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
function refreshUserListDiv(){
	brite.dm.list("Users").done(function(results){
		$("#location-index").show();
		$("#location-user").show();
		$("#location-group").hide();
		$("#locationMenu").empty();
		brite.display('UserComponent',results);
	});
}
//-- reload group list--//
function refreshGroupListDiv(){	
	brite.dm.list("Groups").done(function(results){
		$("#location-index").show();
		$("#location-user").hide();
		$("#location-group").show();
		$("#locationMenu").empty();
		brite.display('GroupComponent',results);	
	});
	
}

function refreshIndexDiv(){
	$("#location-index").show();
	$("#location-user").hide();
	$("#location-group").hide();
	$("#locationMenu").empty();
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