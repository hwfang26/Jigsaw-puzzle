var imgOrigArr = [];
var imgRanArr = [];
var imgArea = $('.imgArea');
var btnStart = $('.start');
var imgW = parseInt(imgArea.css('width'));
var imgH = parseInt(imgArea.css('height'));
var cellW = imgW / 3;
var cellH = imgH / 3;
var imgCell;
var flag = true;

init();

function init(){
	imgSplit();
	gameState();
}

function imgSplit(){
	imgOrigArr = [];
	imgArea.html('');
	var cell = '';
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 3; j++){
			//给初始数组每一位做标识
			imgOrigArr.push(i * 3 + j);
			cell = $('<div class="imgCell"></div>');
			//渲染每个图片和各自的位置
			$(cell).css({
				'width': cellW + 'px',
				'height': cellH + 'px',
				'left': j * cellW + 'px',
				'top': i * cellH + 'px',
				'backgroundPosition' : (-j) * cellW + 'px ' + (-i) * cellH + 'px',
			});
			imgArea.append(cell);
		}
	}
	imgCell = $('.imgCell');
}

function gameState(){
	btnStart.on('click',function(){
		if(flag){
			$(this).text('复原');
			flag = false;
			randomArr(); //数组乱序
			cellOrder(imgRanArr);//渲染乱序后的图片位置
			//鼠标拖动事件
			imgCell.on('mousedown',function(e){
				var index1 = $(this).index();
				/*
					e.pageX为鼠标相对文档的横坐标,imgCell.eq(index1).offset().left为元素相对父级的偏移量left
					两者相减就是鼠标相对当前元素的位置
				*/
				var cellX = e.pageX - imgCell.eq(index1).offset().left;
				var cellY = e.pageY - imgCell.eq(index1).offset().top;

				$(document).on('mousemove',function(e2){
					imgCell.eq(index1).css({
						//防止元素移动过程被覆盖
						'z-index':'999',
						//获取元素新的位置偏移量
						'left': e2.pageX - cellX - imgArea.offset().left + 'px',
						'top': e2.pageY - cellY - imgArea.offset().top + 'px'
					});
				}).on('mouseup',function(e3){
					var left = e3.pageX - imgArea.offset().left;
					var top = e3.pageY - imgArea.offset().top;
					//在乱序数组中获取鼠标释放位置的图片是由原始数组哪个位置的图片跑过来的
					var index2 = changeIndex(left,top,index1);

					if(index1 == index2){
						cellReturn(index1);//如果移动范围超出界限,让元素回到移动前的位置
					}else{
						cellChange(index1, index2);//交互两张图片位置
					}
					$(document).off('mousemove').off('mouseup');
				})
			})
		}else{
			$(this).text('开始');
            flag = true;
            cellOrder(imgOrigArr);
            imgCell.off('mouseover').off('mousedown').off('mouseup');
		}
	})
}

//数组乱序(注意这里是生成一个乱序数组,再让图片根据每个位置数组上的数字去排列,而不是说生成的乱序数组就是图片的顺序)
//(并不是说乱序数组该位置的数字就代表该位置是第几张图片,而是说该位置的图片跑到原始数组该数字所对应的位置)
function randomArr(){
	imgRanArr = [];
	var len = imgOrigArr.length;
	var order;

	for(var i = 0; i < len; i++){
		//取0-8之间的数
		order = Math.floor(Math.random() * len);
		//如果数组里已经有数字了,判断当前数字是否已存在,如果已存在则重新生成
		if(imgRanArr.length > 0){
			while($.inArray(order, imgRanArr) > -1){
				order = Math.floor(Math.random() * len);
			}
		}

		imgRanArr.push(order);
	}
	return;
}

//根据原始数组或乱序数组修改九张图片各自的偏移位置(每张图片的原始位置都是i * 3 + j)
function cellOrder(arr){
	var len = arr.length;
	for(var i = 0; i < len; i++){
		//数组每一位的数字是由 i * 3 + j 得来,所以将它除三取余就得到它所该位于的列,除三取整就得到它所应该位于的行
		imgCell.eq(i).animate({
			//让原始数组图片的位置根据乱序数组的数字跑到对应的新位置
			'left': arr[i] % 3 * cellW + 'px',
			'top': Math.floor(arr[i] / 3) * cellH + 'px'
		},400)
	}
}

function changeIndex(x,y,index){
	//判断元素移动是否出界
	if(x < 0 || x > imgW || y < 0 || y > imgH){
		return index;
	}

	var row = Math.floor(y / cellH),
		col = Math.floor(x / cellW),
		num = row * 3 + col; //获取鼠标释放时的位置所对应的原始数组该位置的数值

	var i = 0,len = imgRanArr.length;
	/*
		要进行位置调换,就得知道鼠标释放时该位置的图片是原始数组哪一张图片跑过来的。
		先从乱序数组中找到num在乱序数组中的位置(索引值),该索引值就是该位置图片原来在原始数组中的位置
	*/
	while((i < len) && (imgRanArr[i] != num)){
		i++;
	}
	return i;
}

//如果鼠标移动位置超出范围,则让图片回到挪动前的位置
function cellReturn(index){
	//找出乱序数组中该索引位置所对应的数字,再让图片根据这个数字找到自己的位置(并不是说乱序数组该位置的数字就代表该位置是第几张图片)
	var row = Math.floor(imgRanArr[index] / 3);
	var col = imgRanArr[index] % 3;

	imgCell.eq(index).animate({
		'top': row * cellH + 'px',
		'left': col * cellW + 'px'
	},400,function(){
		$(this).css('z-index','10');//恢复原始的覆盖值
	})
}

//交换图片位置
function cellChange(from,to){
	var rowFrom = Math.floor(imgRanArr[from] / 3),
        colFrom = imgRanArr[from] % 3,
        rowTo = Math.floor(imgRanArr[to] / 3),
        colTo = imgRanArr[to] % 3,
        temp = imgRanArr[from];

    //把from图片移到to图片位置
    imgCell.eq(from).animate({
        'top': rowTo * cellH + 'px',
        'left': colTo * cellW + 'px',
    }, 400, function () {
        $(this).css('z-index', '10');
    });
    //把to图片移到from图片位置
    imgCell.eq(to).animate({
        'top': rowFrom * cellH + 'px',
        'left': colFrom * cellW + 'px',
    }, 400, function () {
        $(this).css('z-index', '10');
        //移动完后更新乱序数组
        imgRanArr[from] = imgRanArr[to];
        imgRanArr[to] = temp;
        //检查拼图是否复原
        check();
    })
}

//检查拼图是否复原
function check(){
    if (imgOrigArr.toString() == imgRanArr.toString()) {
        alert('拼图成功！');
        flag = true;
        btnStart.text('开始');
    }
}
