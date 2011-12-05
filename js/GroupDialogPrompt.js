// Best Practice 

// create the namespace
var briteTest = briteTest || {};

// enclose all the component code in a immediate JS function (and make it $ safe by passing the jQuery as param)

(function($){
	
	// --------- Brite UI Component Interface Implementation ---------- //
	function GroupDialogPrompt(){};
	
	GroupDialogPrompt.prototype.create = function(data,config){
		var json = {};
		json.groups = data;
        var html = $("#tmplGroupPromptContent").render(json);
        var $e = $(html);
        return $e;		
	}
	
	GroupDialogPrompt.prototype.postDisplay = function(data,config){
		//always reassign the component "this" to "c" to avoid closure scope confusion
        var c = this;

        c.$element.find("input.ok").click(function(){
        	var groups=[];
        	c.$element.find(".groupcheck:checked").each(function(){
        		var group = {};
        		group.id=$(this).attr("data-obj_id");
        		group.name=$(this).attr("data-obj_name");
        		groups.push(group);
        	});
            c.setAnswer(groups);
        });
        
        c.$element.find("input.dialogcancle").click(function(){
            c.setAnswer(null);
        });		
	}
	
	// --------- /Brite UI Component Interface Implementation ---------- //
	
    // --------- Custom GroupDialogPrompt Public Methods --------- //
    
    // Note: this can be any API the developers was to expose
    
    // this is called by the caller to register a callBack on the "answerEvent"
    GroupDialogPrompt.prototype.onAnswer = function(answerCallBack){
        this._answerCallBack = answerCallBack;
    },
    
    // this will be called by this component (from the postDisplay logic) when the user answer the prompt dialog
    GroupDialogPrompt.prototype.setAnswer = function(answer){
        this.answer = answer;
        if (this._answerCallBack) {
            this._answerCallBack(answer);
        }
        this.close();
    },
    
    // this will be call by this component when the user close the dialog by answering or pressing esc
    GroupDialogPrompt.prototype.close = function(){
        this.$element.bRemove();
    }
    // --------- /Custom GroupDialogPrompt Public Methods --------- //			
	
	
	// add the GroupDialogPrompt component definition to the briteTest namespace
	briteTest.GroupDialogPrompt = GroupDialogPrompt;
	
	
})(jQuery);

