(function($){
    var supportedAnimation = {'slide':1, 'fade':1};//私有变量，不能被外界修改
    function BestSlider(selector, options){
        var defaultOptions = {
            animation:'slide',//slide, fade
            speed:800,//动画速度
            interval:2000,//自动播放时间间隔，这个时间间隔包含了slide的切换时间,所以其值不能小于speed
            auto:true,//是否自动轮播
            keyboard:false, //是否开启键盘控制键:上下左右方向键
            hover2stop:false,//鼠标悬浮则停止自动播放,要和auto:true一起使用才有效
            complete:function(bs){},//每次slide切换结束的回调函数
            before:function(bs, idx){}//动画执行之前调用函数
        }
        this.options = $.extend({}, defaultOptions, options);
        this.selector = selector;
        this.lastIdx = this.currIdx = 0;
        this.slider = $(selector);
        this.box = this.slider.children('.slider-box');
        this.item = this.box.children('.slider-item');
        
        this.init();
        this.bindEvents();
    }
    BestSlider.prototype.reset = function(){
        var sl = this.slider;
        var width =this.options.width = sl.width(), height = sl.height();//缓存一下slider.width()到this.options.width中，因为下面可能会用到
        var itemLen = this.item.length, animation = this.options.animation;
        this.item.width(width).height(height);
        //检测animation是否被支持
        if(!(animation in supportedAnimation)){
            animation = 'slide';
        } 
        if(animation == 'slide') this.box.width(width *itemLen);
    }
    BestSlider.prototype.init = function(){
        var itemLen = this.item.length, animation = this.options.animation;
        this.reset();
         
        //根据不同的animation执行不同的初始化操作
        if(animation == 'fade'){
            this.box.css({position:'relative'});
            this.item.css({position:'absolute', left:0, top:0});
            for(var i = 1; i < itemLen; i++){
                this.item.eq(i).fadeOut(0);
            }
        }
        
        if(this.options.auto){
            this.startAutoSlide();
        }
    };
    BestSlider.prototype.slideTo = function(idx){
        var self = this, 
            itemLen = self.item.length,
            animation = self.options.animation;
        if(self.box.is(':animated')) return;
        if(idx >= itemLen){
            idx = idx%itemLen;
        }else if(idx < 0){
            idx = itemLen + idx%itemLen;
        }
        
        self.options.before(self, idx);
        if(animation == 'slide'){
            self.box.animate({
                marginLeft: -idx * self.options.width         
            },{
                duration:self.options.speed,
                easing:'easeInQuint',
                complete:function(){
                    self.lastIdx = self.currIdx;
                    self.currIdx = idx;
                    self.options.complete(self);
                }
            }); 
        }else if(animation == 'fade'){
            self.item.eq(self.currIdx).fadeOut(self.options.speed);
            self.item.eq(idx).fadeIn(self.options.speed,function(){
                self.lastIdx = self.currIdx;
                self.currIdx = idx;
                self.options.complete(self);
            });
        }
    };
    BestSlider.prototype.next = function () {
        this.slideTo(this.currIdx + 1); 
    };
    BestSlider.prototype.prev = function () {
        this.slideTo(this.currIdx - 1);   
    };
    BestSlider.prototype.startAutoSlide = function(){
        var self = this;
        if(self.inervalId) self.stopAutoSlide();//这里加一层保障，启动之前先确认其他的已经关闭。
        self.inervalId = setInterval(function(){
            self.next();
        }, self.options.interval);  
    };
    BestSlider.prototype.stopAutoSlide = function(){
        var self = this;
        if(self.inervalId) clearInterval(self.inervalId);
    };
    BestSlider.prototype.bindEvents = function(){
        var self = this;
        if(self.options.keyboard){
            $(document).keyup(function(e){
                var which = e.which;
                if(which == 37 || which == 38){//left
                    self.prev();
                }else if(which == 39 || which == 40){//right
                    self.next();
                }
            });
        }
        
        if(self.options.auto && self.options.hover2stop){
            self.slider.hover(function(){
                self.stopAutoSlide();
            }, function(){
                self.startAutoSlide();
            });
        }
        
        $(window).resize(function(){
            self.reset();
        });
    }; 
    
    window.BestSlider = BestSlider;
})(jQuery);