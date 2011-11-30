$(function(){
	
	
	var groupStore = [{id:"001",name:"group1"},{id:"002",name:"group2"}];
	
	var userStore = [{id:"001",email:"001@a.com",name:"Mike1",pno:"123456",groups:[]},{id:"002",email:"002@a.com",name:"Mike2",pno:"123456",groups:[]},{id:"003",email:"003@a.com",name:"Mike3",pno:"123456",groups:[]},{id:"004",email:"004@a.com",name:"Mike4",pno:"123456",groups:[]},{id:"005",email:"005@a.com",name:"Mike5",pno:"123456",groups:[]}];
	
	
	brite.registerDao("group",new brite.dao.SimpleDao(groupStore));
	brite.registerDao("user",new brite.dao.SimpleDao(userStore));
	
	initContactListDiv();
					
	brite.addDataChangeListener("user",function(daoChangeEvent){
			refreshUserListDiv();
	});
	brite.addDataChangeListener("group",function(daoChangeEvent){
			refreshGroupListDiv();
	});
	
	
	

});
//  --reload user list --//
function refreshUserListDiv(){
	$userList = $("#user_div");
	$userList.empty();
	brite.dm.list("user").done(function(userList){
		
		brite.display('UserComponent',userList);					
	});
}
//-- reload group list--//
function refreshGroupListDiv(){
	$("#group_div").empty();
	brite.dm.list("group").done(function(groupList){
		
		brite.display('GroupComponent',groupList);					
	});
}
//-- init page--//
function initContactListDiv(){
	refreshGroupListDiv();
	refreshUserListDiv();
	
}

//  -----open group div ,set the checked status if the group was selected--//
function addGroupToUser(id){
	brite.dm.get("user",id).done(function(user){
		
		var userList = user.groups||[];
		$('#selectedUname').html(user.name);
		$('#selectedUid').val(user.id);
		brite.dm.list("group").done(function(groupList){
			var glen = groupList.length;
			for(var i=0;i<glen;i++){
				
				if(isInGroupList(userList,groupList[i])){
					groupList[i].chkflg='checked';
				}else{
					groupList[i].chkflg='';
				}
				
			}
			$("#group_div").empty();
			brite.display('GroupComponent',groupList);					
		});

							
	});

	$("#group_div_top").show();
}
// -- check the check box status--//
function isInGroupList(list,obj){
	var glen = list.length;
	for(var i=0;i<glen;i++){
			if(list[i].id==obj.id){
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