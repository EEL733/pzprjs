// MouseInput.js v3.5.2

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
MouseEvent:{
	initialize : function(){
		this.cursor = this.puzzle.cursor;

		this.enableMouse = true;	// マウス入力は有効か

		this.mouseCell = null;		// 入力されたセル等のID
		this.firstCell = null;		// mousedownされた時のセルのID(連黒分断禁用)

		this.inputPoint = new this.klass.RawAddress();	// 入力イベントが発生したborder座標 ※端数あり
		this.firstPoint = new this.klass.RawAddress();	// mousedownされた時のborder座標 ※端数あり
		this.prevPos    = new this.klass.Address();		// 前回のマウス入力イベントのborder座標

		this.btn = {};				// 押されているボタン
		this.inputData = null;		// 入力中のデータ番号(実装依存)

		this.bordermode = false;	// 境界線を入力中かどうか

		this.mousestart = false;	// mousedown/touchstartイベントかどうか
		this.mousemove = false;		// mousemove/touchmoveイベントかどうか
		this.mouseend = false;		// mouseup/touchendイベントかどうか

		this.mousereset();
	},

	RBShadeCell : false,	// 連黒分断禁のパズル

	use      : false,	// 黒マスの入力方法選択
	bgcolor  : false,	// 背景色の入力を可能にする
	redline  : false,	// 線の繋がりチェックを可能にする
	redblk   : false,	// 黒マスつながりチェックを可能にする (連黒分断禁も)

	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		var cell0 = this.mouseCell;

		this.mouseCell = // 下の行へ続く
		this.firstCell = this.board.emptycell;

		this.firstPoint.reset();
		this.prevPos.reset();

		this.btn = { Left:false, Middle:false, Right:false};
		this.inputData = null;

		this.bordermode = false;

		this.mousestart = false;
		this.mousemove  = false;
		this.mouseend   = false;
		
		if(this.puzzle.execConfig('dispmove') && !!cell0 && !cell0.isnull){ cell0.draw();}
	},

	//---------------------------------------------------------------------------
	// mv.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
	// mv.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
	// mv.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
	// mv.e_mouseout()  マウスカーソルがウィンドウから離れた際のイベント共通処理
	//---------------------------------------------------------------------------
	//イベントハンドラから呼び出される
	// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
	e_mousedown : function(e){
		if(!this.enableMouse){ return true;}
		
		this.setMouseButton(e);			/* どのボタンが押されたか取得 (mousedown時のみ) */
		var addrtarget = this.getBoardAddress(e);
		this.moveTo(addrtarget.bx, addrtarget.by);
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mouseup   : function(e){
		if(!this.enableMouse){ return true;}
		
		this.inputEnd();
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mousemove : function(e){
		if(!this.enableMouse){ return true;}
		
		var addrtarget = this.getBoardAddress(e);
		this.lineTo(addrtarget.bx, addrtarget.by);
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mouseout : function(e){ },

	//---------------------------------------------------------------------------
	// mv.setMouseButton()  イベントが起こったボタンを設定する
	// mv.getBoardAddress() イベントが起こったcanvas内の座標を取得する
	//---------------------------------------------------------------------------
	setMouseButton : function(e){
		this.btn = pzpr.util.getMouseButton(e);
		
		// SHIFTキー/Commandキーを押している時は左右ボタン反転
		var kc = this.puzzle.key;
		kc.checkmodifiers(e);
		if((kc.isSHIFT || kc.isMETA)!==this.puzzle.getConfig('lrcheck')){
			if(this.btn.Left !== this.btn.Right){
				this.btn.Left  = !this.btn.Left;
				this.btn.Right = !this.btn.Right;
			}
		}
	},
	getBoardAddress : function(e){
		var puzzle = this.puzzle, pc = puzzle.painter;
		var pix = (!isNaN(e.offsetX) ? {px:e.offsetX, py:e.offsetY} : {px:e.layerX, py:e.layerY}); // Firefox 39以前対応
		var g = pc.context;
		if(!!g && g.use.vml){
			var pagePos = pzpr.util.getPagePos(e),
				rect = pzpr.util.getRect(pc.context.child);
			pix.px = (pagePos.px - rect.left - 2) + 0.33 * pc.bw;
			pix.py = (pagePos.py - rect.top  - 2) + 0.33 * pc.bh;
			if(puzzle.board.hasexcell>0){
				pix.px += 2 * pc.bw;
				pix.py += 2 * pc.bh;
			}
		}
		return {bx:(pix.px-pc.x0)/pc.bw, by:(pix.py-pc.y0)/pc.bh};
	},

	//---------------------------------------------------------------------------
	// mv.moveTo()   Canvas上にマウスの位置を設定する
	// mv.lineTo()   Canvas上でマウスを動かす
	// mv.inputEnd() Canvas上のマウス入力処理を終了する
	//---------------------------------------------------------------------------
	moveTo : function(bx,by){
		this.inputPoint.init(bx,by);
		this.mouseevent(0);
	},
	lineTo : function(bx,by){
		/* 前回の位置からの差分を順番に入力していきます */
		var dx = (bx-this.inputPoint.bx), dy = (by-this.inputPoint.by);
		var distance = (((dx>=0?dx:-dx)+(dy>=0?dy:-dy))*2+0.9)|0; /* 0.5くらいずつ動かす */
		var mx = dx/distance, my = dy/distance;
		for(var i=0;i<distance-1;i++){
			this.inputPoint.move(mx,my);
			this.mouseevent(1);
		}
		this.inputPoint.init(bx,by);
		this.mouseevent(1);
	},
	inputEnd : function(){
		this.mouseevent(2);
		this.mousereset();
	},

	//---------------------------------------------------------------------------
	// mv.mouseevent() マウスイベント処理
	//---------------------------------------------------------------------------
	mouseevent : function(step){
		this.cancelEvent = false;
		this.mousestart = (step===0);
		this.mousemove  = (step===1);
		this.mouseend   = (step===2);
		
		var puzzle = this.puzzle;
		puzzle.emit('mouse');
		if(!this.cancelEvent && (this.btn.Left || this.btn.Right)){
			if(this.mousestart){
				puzzle.opemgr.newOperation();
				puzzle.board.errclear();
			}
			else{ puzzle.opemgr.newChain();}
			
			if(!this.mousestart || !this.dispRed()){
				this.mouseinput();		/* 各パズルのルーチンへ */
			}
		}
	},

	//---------------------------------------------------------------------------
	// mv.dispRed()   赤く表示する際などのイベント処理
	//---------------------------------------------------------------------------
	dispRed : function(){
		var puzzle = this.puzzle, isZ = puzzle.key.isZ;
		var flagline = puzzle.validConfig('redline') && !!(puzzle.getConfig('redline') ^isZ);
		var flagblk  = puzzle.validConfig('redblk') && !!(puzzle.getConfig('redblk') ^isZ);
		
		if     (flagline){ this.dispRedLine();}
		else if(flagblk) { this.dispRedBlk();}
		return (flagline || flagblk);
	},

	//---------------------------------------------------------------------------
	// mv.mouseinput() マウスイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	mouseinput : function(){ },

	//---------------------------------------------------------------------------
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	//---------------------------------------------------------------------------
	notInputted : function(){ return !this.puzzle.opemgr.changeflag;},

	//---------------------------------------------------------------------------
	// mv.getcell()    入力された位置がどのセルに該当するかを返す
	// mv.getcell_excell()  入力された位置がどのセル/EXCELLに該当するかを返す
	// mv.getcross()   入力された位置がどの交差点に該当するかを返す
	// mv.getborder()  入力された位置がどの境界線・Lineに該当するかを返す(クリック用)
	// mv.getpos()    入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(bd.qcols*2,bd.qrows*2)。rcは0～0.5のパラメータ。
	// mv.isBorderMode() 境界線入力モードかどうか判定する
	//---------------------------------------------------------------------------
	getcell : function(){
		return this.getpos(0).getc();
	},
	getcell_excell : function(){
		var pos = this.getpos(0), excell = pos.getex();
		return (!excell.isnull ? excell : pos.getc());
	},
	getcross : function(){
		return this.getpos(0.5).getx();
	},

	getpos : function(spc){
		var addr=this.inputPoint, m1=2*spc, m2=2*(1-spc);
		// 符号反転の影響なく計算したいので、+4して-4する
		var bx=addr.bx+4, by=addr.by+4, dx=bx%2, dy=by%2;
		bx = (bx&~1) + (+(dx>=m1)) + (+(dx>=m2)) - 4;
		by = (by&~1) + (+(dy>=m1)) + (+(dy>=m2)) - 4;
		return (new this.klass.Address(bx,by));
	},

	getborder : function(spc){
		var addr = this.inputPoint;
		var bx = (addr.bx&~1)+1, by = (addr.by&~1)+1;
		var dx = addr.bx+1-bx, dy = addr.by+1-by;

		// 真ん中のあたりはどこにも該当しないようにする
		var bd = this.board;
		if(bd.linegraph.isLineCross){
			if(!bd.borderAsLine){
				var m1=2*spc, m2=2*(1-spc);
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return bd.emptyborder;}
			}
			else{
				var m1=2*(0.5-spc), m2=2*(0.5+spc);
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return bd.emptyborder;}
			}
		}

		if(dx<2-dy){	//左上
			if(dx>dy){ return bd.getb(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.getb(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.getb(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.getb(bx,  by+1);}	//右下＆左下 -> 下
		}
		return bd.emptyborder;
	},

	isBorderMode : function(){
		if(this.mousestart){
			this.bordermode = !this.getpos(0.25).oncell();
		}
		return this.bordermode;
	},

	//---------------------------------------------------------------------------
	// mv.setcursor() TargetCursorの場所を移動する
	//---------------------------------------------------------------------------
	setcursor : function(pos){
		var pos0 = this.cursor.getaddr();
		this.cursor.setaddr(pos);
		pos0.draw();
		pos.draw();
	}
}
});
