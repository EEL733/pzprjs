//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.4.1
//
pzpr.classmgr.makeCustom(['firefly'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(!this.notInputted()){ return;}
			if(this.mousestart || this.mousemove){
				this.inputdirec();
			}
			else if(this.mouseend){
				if(this.prevPos.getc()===this.getcell()){ this.inputqnum();}
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	minnum : 0
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

Flags:{
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	fontErrcolor : "black", /* fontcolorと同じ */

	globalfontsizeratio : 0.85,

	paint : function(){
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes();

		this.drawFireflies();
		this.drawNumbers();

		this.drawTarget();
	},

	drawFireflies : function(){
		var g = this.vinc('cell_firefly', 'auto');

		g.lineWidth = 1.5;
		g.strokeStyle = this.quescolor;

		var rsize  = this.cw*0.40;
		var rsize3 = this.cw*0.10;

		var headers = ["c_cira_", "c_cirb_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;

			if(cell.qnum!==-1){
				var px = cell.bx*this.bw, py = cell.by*this.bh;

				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[0]+id,this.FILL)){
					g.shapeCircle(px, py, rsize);
				}

				g.vdel(headers[1]+id);
				if(cell.qdir!==0){
					g.fillStyle = this.quescolor;
					switch(cell.qdir){
						case cell.UP: py-=(rsize-1); break;
						case cell.DN: py+=(rsize-1); break;
						case cell.LT: px-=(rsize-1); break;
						case cell.RT: px+=(rsize-1); break;
					}
					if(this.vnop(headers[1]+id,this.NONE)){
						g.fillCircle(px, py, rsize3);
					}
				}
			}
			else{ g.vhide([headers[0]+id, headers[1]+id]);}
		}
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawFireflies();
		this.drawNumbers();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount_firefly(3) ){ return 'lnBranch';}
		if( !this.checkLineCount_firefly(4) ){ return 'lnCross';}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,4) ){ return 'lcInvDirB';}
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 'lcInvDirW';}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 'lcCurveNe';}
		if( !this.checkErrorFlag_line(xinfo,1) ){ return 'lcDeadEnd';}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkOneArea(linfo) ){ return 'lcDivided';}

		if( !this.checkLineCount_firefly(1) ){ return 'lnDeadEnd';}

		if( !this.checkFireflyBeam() ){ return 'nmNoLine';}

		return null;
	},

	/* 線のカウントはするが、○のある場所は除外する */
	checkLineCount_firefly : function(val){
		if(this.owner.board.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt===val);});
	},
	checkFireflyBeam : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], dir=cell.getQdir();
			if(cell.noNum() || dir===0){ continue;}
			if(!cell.getaddr().movedir(dir,1).getb().isLine()){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	isErrorFlag_line : function(xinfo){
		var path=xinfo.path[xinfo.max], ccnt=path.ccnt, length=path.length;
		var cell1=path.cells[0], cell2=path.cells[1], dir1=path.dir1, dir2=path.dir2;

		// qd1 スタート地点の黒点の方向 qd2 到達地点の線の方向
		var qd1=cell1.qdir, qd2=(!cell2.isnull ? cell2.qdir : cell2.NDIR), qn=-1, err=0;
		if((dir1===qd1)^(dir2===qd2)){ qn=(dir1===qd1 ? cell1 : cell2).qnum;}

		if     (!cell2.isnull && (dir1===qd1) && (dir2===qd2)){ err=4;}
		else if(!cell2.isnull && (dir1!==qd1) && (dir2!==qd2)){ err=3;}
		else if(!cell2.isnull && qn>=0 && qn!==ccnt){ err=2; path.cells=[cell1];}
		else if( cell2.isnull){ err=1;}
		path.error = err;
	}
},

FailCode:{
	nmNoLine : ["ホタルから線が出ていません。", "There is a lonely firefly."],
	lcInvDirB : ["黒点同士が線で繋がっています。","Points are connected each other."],
	lcInvDirW : ["白丸の、黒点でない部分どうしがくっついています。","Fireflies are connected without a line starting from point."],
	lcCurveNe : ["線の曲がった回数が数字と違っています。","The number of curves is different from a firefly's number."]
}
});
