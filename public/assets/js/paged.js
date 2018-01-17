var paged = function(selector, options){
  this.$el = $(selector);
  options.hasextra  = (typeof options.extra == 'function');
  options.u_id =  Berry.getUID();
  options.items = _.map(options.items, function(item) {
    item.key = options.u_id+item.name.replace(/ /g,"_");
    return item;
  })
  options.fields = _.map(options.items, function(item) {
        return {fieldset:item.key,name:item.key};        
  })  
  options.attributes  = {};
  _.map(options.items, function(item) {
    if(typeof item.content == 'object'){
      item.content = JSON.stringify(item.content)
    }
    options.attributes[item.key] = item.content; 
  })
  options.default ={label: false,type:'ace',mode:options.mode || 'ace/mode/handlebars'}
  this.options = $.extend(true,{editable: true},options);
  $(selector).html(templates.pages.render(this.options,templates));
  this.berry = $(selector+' .dummyTarget').berry(this.options);

  this.render = function(){
    $(selector+' .list-group').empty().html(templates.pages_listgroupitem.render(this.options));
    $('[href="#'+this.active+'"]').click();
  }

  $(selector+' .actions .pages_delete,'+selector+' .actions .pages_edit,'+selector+' .actions .pages_new,'+selector+' .pages_extra').on('click', function(e){
    var currentItem = _.findWhere(this.options.items, {key: this.active});
    if($(e.currentTarget).hasClass('pages_delete') && !currentItem.disabled){
      currentItem.removed = true;
      this.render();
    }else{
      if($(e.currentTarget).hasClass('pages_edit') && !currentItem.disabled){
        $().berry({name:'page_name', legend: 'Edit Section', attributes: {name: currentItem.name},fields: {'Name': {}}}).on('save', function(){
          _.findWhere(this.options.items, {key:this.active}).name = Berries.page_name.toJSON().name;
          this.render();
          Berries.page_name.trigger('close');
        }, this);
      }else{
        if($(e.currentTarget).hasClass('pages_new')){
          $().berry({name:'page_name', legend: 'New Section',fields: {'Name': {}}}).on('save', function(){
            var name = Berries.page_name.toJSON().name;
            var key = this.options.u_id+name.replace(/ /g,"_");

            this.options.items.push({name: name,key:key, content:""})
            this.active = key;
            this.$el.find('.tab-content').append(templates.pages_tabpanel.render({name: name,key:key, content:""}));
            this.berry.createField($.extend({name:key},this.berry.options.default), this.$el.find('.tab-content').find('#'+key),null)
            this.render();

            Berries.page_name.trigger('close');
          }, this);
        }else{
          if($(e.currentTarget).hasClass('pages_extra')) {
            this.options.extra.call(this, currentItem);
          }
        }
      }
    }
  }.bind(this));

  $(selector).on('click','.list-group-item.tab',function(e){
    $(e.currentTarget).parent().find('.list-group-item').removeClass('active');
    $(e.currentTarget).addClass('active');
    this.active = $(e.currentTarget).attr('aria-controls');
    this.berry.fields[this.active].editor.clearSelection();
 this.berry.fields[this.active].focus();
  }.bind(this))
  $(selector).find('.list-group-item.tab').first().click();

  return {
    toJSON:function(){
      var options = this.options;
      var temp = _.map(this.berry.toJSON(),function(item,i){
        var cachedItem = _.findWhere(options.items, {key:i});
        
        if(typeof cachedItem !== 'undefined' && !cachedItem.removed){
          return {name: _.findWhere(options.items, {key:i}).name, content: item};
        }else{
          return false;
        }
      });
      return _.filter(temp, function(item){return item;});
    }.bind(this),
    getCurrent:function(){
      return _.findWhere(this.options.items, {key: this.active});
    }.bind(this),
    update:function(key,value){
      this.berry.fields[key].setValue(value)
    }.bind(this)
  //  setCurrent: function(value){
  //   //  return currentItem;
  //   //  return _.findWhere(this.options.items, {key: this.active});
  //   // debugger;
  //   this.berry.fields[this.active].setValue(value)

  //   }.bind(this)
  }
}