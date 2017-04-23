var domUtils = new DOMUtils();
var gol = new GOL();
var mouseUtils = new MouseUtils();
var patternUtils = new PatternUtils();
var patternDrawer = new PatternDraw(patternUtils);
gol.init();
mouseUtils.init(gol, patternDrawer);
gol.addListeners(mouseUtils);

/*******************************************
 * Window events
 *******************************************/
window.onload = function () {

    $('body').css('overflow', 'hidden');

    initEnterDialog(); 

    $('#gol-cmd').css('top', 6); 
    $('#gol-library').css('height', $(window).height());
    $('#multigol-clients').css('height', $(window).height());

    initGolCommands();

    // Bluring of a & button tags :
    var aElements = document.getElementsByTagName('a');
    for (var i = 0, len = aElements.length; i < len; i++) {
        aElements[i].onfocus = function () {
            if (this.blur) this.blur();
        }
    }
    aElements = document.getElementsByTagName('button');
    for (var i = 0, len = aElements.length; i < len; i++) {
        aElements[i].onfocus = function () {
            if (this.blur) this.blur();
        }
    }

    patternDrawer.init(gol, 'gol_canvas_draw');
    hideDrawCanvas();
};

window.onresize = function() {
    // resize library view.
    hideAllSidePanes();
    $('#gol-library').css('height', $(window).height());
    gol.initCanvas('gol_canvas');
    gol.initGridCanvas('gol_canvas_grid');
    patternDrawer.init(gol, $('#gol_canvas_draw'));
};

document.getElementById('multigol-tmpimg-file').onchange = function(evt) {
    
    let tgt = evt.target || window.event.srcElement, files = tgt.files;
    // FileReader support
    if (FileReader && files && files.length) {

        let iconimage = new Image();
        iconimage = $('#multigol-tmpimg-input');
        $(iconimage).attr('src', null);
        $(iconimage).css('display', 'none');

        $(iconimage).load(function() {
            let c = document.getElementById('multigol-tmpimg-canvas');
            let ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(this, 0, 0, gol.getCellSize(), gol.getCellSize());
            let resizedB64 = c.toDataURL();
            this.src = resizedB64;
            $('#multigol-tmpimg-loading-img').attr('hidden', true);
            this.style.display = 'inline';
        });

        let fr = new FileReader();
        fr.onload = function () {
            $(iconimage).attr('src', fr.result);
        }

        fr.readAsDataURL(files[0]);
    } else { 
        alert('Your browser is to old, update it.');
    }
};

window.onbeforeunload = function () {
    quit();
};

/*
 * Move spatial zone up, down, left or right.
 */
function moveSpatialZone(direction) {

    switch (direction) {
        case 'up':
            gol.decrementZoneDisplay(1);
            break;
        case 'down':
            gol.incrementZoneDisplay(1);
            break;
        case 'right':
            gol.incrementZoneDisplay(0);
            break;
        case 'left':
            gol.decrementZoneDisplay(0);
            break;
        default:
            break;
    }
}

/**
 *
 */
function initEnterDialog() {

    document.getElementById('enter-dialog').style.top = 
        (height() / 2) - (document.getElementById('enter-dialog').clientHeight / 2) + 'px';
    document.getElementById('enter-dialog').style.left = 
        (width() / 2) - (document.getElementById('enter-dialog').clientWidth / 2) + 'px';
    document.getElementById('multigol-tmpimg-file').value = '';
    document.getElementById('enter-dialog-nickname').value = '';
    document.getElementById('multigol-tmpimg-file').disabled = false;
    document.getElementById('enter-dialog-file').disabled = false;
    document.getElementById('enter-dialog-fader').style.width = gol.getCanvasWidth() + 'px';
    document.getElementById('enter-dialog-fader').style.height = (gol.getCanvasHeight() + 12) + 'px';
    document.getElementById('enter-dialog-nickname').focus();

    $('#enter-dialog-file').click(function() {
        $('#multigol-tmpimg-input').attr('src', null);
        $('#multigol-tmpimg-input').css('display', 'none');
        $('#multigol-tmpimg-loading-img').attr('hidden', false);
        $("#multigol-tmpimg-file").click();
    });

    $('#enter-dialog-nickname').keyup(function() {
        let nickname = $('#enter-dialog-nickname').val();
        let tmpNickname = '';
        for (var i = 0; i < nickname.length; ++i) {
            if (nickname[i] != '$' && nickname[i] != '-' && nickname[i] != '/' && 
                nickname[i] != '\\' && nickname[i] != '~') {
                tmpNickname += nickname[i];
            }
        }
        gol.getSocket().emit('app-join-check', tmpNickname);
    });
}

/*
*
*/
function initGolCommands() {

    /////////////////////////////////////////////////////////////
    // Init cmd events :
    $('#gol-cmd-inf').on('click', function() {
        $('#gol-status-data').toggle(332);
    });
    $('#gol-cmd-lib').on('click', function() {
        $('#multigol-clients').hide(120);
        updateCmdDisplay('gol-library');
    });
    $('#gol-cmd-cli').on('click', function() {
        $('#gol-library').hide(120);
        updateCmdDisplay('multigol-clients');
    });
    $('#gol-cmd-reset').on('click', function() {
        resetToDefaultZoom();
    });
    $('#gol-cmd-zoomout').on('click', function() {
        zoomOutGol();
    });
    $('#gol-cmd-zoomin').on('click', function() {
        zoomInGol();
    });
    $('#gol-cmd-draw').on('click', function() {
        hideAllSidePanes();
        hideAllIcons();
        showDrawCanvas();
    });
    $('#gol-cmd-close-all').on('click', function() {
        hideAllSidePanes();
    });

    /////////////////////////////////////////////////////////////
    // side pane events :
    $('#multigol-clients').mouseleave(function() {
        hideAllSidePanes();
    });
    $('#gol-library').mouseleave(function() {
        hideAllSidePanes();
    });
    
    /////////////////////////////////////////////////////////////
    // Init pattern draw cmd events :
    $('#gol-cmd-close-pattern-draw').on('click', function() {
        hideDrawCanvas();
        showAllIcons();
        cursorClear();
        gol.setLibTransfer(false);
        gol.setAllowLibTransfer(true);
        patternDrawer.cleanup();
    });
    $('#gol-cmd-send-pattern').on('click', function() {
        patternDrawer.send();
        hideDrawCanvas();
        showAllIcons();
        cursorClear();
        gol.setLibTransfer(false);
        gol.setAllowLibTransfer(true);
        patternDrawer.cleanup();
    });
    $('#gol-cmd-pattern-lib').on('click', function() {
        gol.setLibTransfer(false);
        gol.setAllowLibTransfer(true);
        updateCmdDisplay('gol-library');
    });
    $('#gol-cmd-turn-pattern').on('click', function() {
        patternDrawer.rotate();
    });
    $('#gol-cmd-zoomout-pattern').on('click', function() {
        zoomOutGol();
        patternDrawer.reDraw();
        patternDrawer.reDrawField();
    });
    $('#gol-cmd-zoomin-pattern').on('click', function() {
        zoomInGol();
        patternDrawer.reDraw();
        patternDrawer.reDrawField();
    });
    $('.gol-pattern-cmd-items').mouseover(function() {
        $('#' + this.id + '-desc').css('display', 'inline');
    });
    $('.gol-pattern-cmd-items').mouseleave(function() {
        $('#' + this.id + '-desc').hide(30);
    });

    $('.gol-cmd-items').mouseover(function() {
        $('#' + this.id + '-desc').css('display', 'inline');
    });
    $('.gol-cmd-items').mouseleave(function() {
        $('#' + this.id + '-desc').hide(30);
    });
}

/*************************************************
 * Key & mouse events                             *
 *************************************************/
/*
 * Canvas click event listener.
 */
function canvasClickEvent(e) {
    mouseUtils.canvasClicked(e);
}

/**
 * Enter dialog submit event.
 */
function enterDialogSubmit(nickname, color, fader, dialog) {

    gol.setCellColor($('#' + color).val());
    gol.setNickName($('#' + nickname).val());

    let tmpNickname = '';
    let golNickname = gol.getNickName();
    for (var i = 0; i < golNickname.length; ++i) {
        if (golNickname[i] != '$' && golNickname[i] != '-' && golNickname[i] != '/' && 
            golNickname[i] != '\\' && golNickname[i] != '<' && golNickname[i] != '>') {
            tmpNickname += golNickname[i];
        }
    }
    gol.setNickName(tmpNickname);

    if (gol.isJoinable() === false || tmpNickname == '' || 
        tmpNickname == undefined || tmpNickname == 'undefined') {
        $('#' + nickname).css('border', '1px solid red');
        $('#enter-dialog-button').attr('disabled', 'disabled');
        return;
    }

    // src = base64 encoded.
    let b64 = $('#multigol-tmpimg-input').attr('src');
    gol.setCellimg(0);

    if (b64 !== 'null' && b64 !== null && b64 !== '' && b64 !== undefined) {
        gol.setCellimg(1);
        gol.setCellColor(undefined);
        let c = document.getElementById('multigol-tmpimg-canvas');
        let resizedB64 = c.toDataURL();
        gol.setB64cell(resizedB64);
    }
    
    $('#' + fader).hide();
    $('#' + dialog).hide();

    let client = new User(gol.getNickName(), gol.getNickName(), 
            gol.getCellColor(), gol.getCellimg().toString(),  gol.getB64cell(), 
            undefined, undefined, 0);
    
    gol.getSocket().emit('app-join', client.toJSON());
    addKeyEvents();
    gol.setJoinable('go');
    $('#' + fader).remove();
    $('#' + dialog).remove();
}

/**
 * Stop input taking $ - / or \ chars.
 */
$('#enter-dialog-nickname').bind('change paste keyup', function() {

    let textValue = $('#enter-dialog-nickname').val();
    let tmpNickname = ''
    for (var i = 0; i < textValue.length; ++i) {
        if (textValue[i] != '$' && textValue[i] != '-' 
            && textValue[i] != '/' && textValue[i] != '\\') {
            tmpNickname += textValue[i];
        }
    }
    
    $('#enter-dialog-nickname').val(tmpNickname);
});

/*
 * key too cmd.
 */
function executeKeyEvent() {

    if (KEY_STATUS.up) {
        gol.decrementZoneDisplay(1);
    } else if (KEY_STATUS.down) {
        gol.incrementZoneDisplay(1);
    } else if (KEY_STATUS.right) {
        gol.incrementZoneDisplay(0);
    } else if (KEY_STATUS.left) {
        gol.decrementZoneDisplay(0);
    }

    if (KEY_STATUS.substract) {
        zoomOutGol();
    } else if (KEY_STATUS.add) {
        zoomInGol();
    }

    if (KEY_STATUS.esc) {
        hideAllSidePanes();
    }
}

function addKeyEvents() {

    document.onkeydown = function (e) {

        // Firefox and opera use charCode instead of keyCode to
        // return which key was pressed.
        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;

        if (KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = true;
        }

        // Execute key command :
        executeKeyEvent();
    };

    document.onkeyup = function (e) {

        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = false;
        }
    };
}

/**
 * quit app.
 */
function quit() {
    gol.getSocket().emit('app-exit', gol.getNickName());
}

//////////////////////////////////////////////////
// Display & Zoom in-out :
function zoomInGol() {

    let cellSize = gol.getCellSize();
    if (cellSize < 30) {
        ++cellSize;
        let canvasW = gol.getCanvasWidth();
        let canvasH = gol.getCanvasHeight();
        gol.setGridWidth(canvasW / cellSize);
        gol.setGridHeight(canvasH / cellSize);
        gol.setCellSize(cellSize);
        if (cellSize >= 4) {
            gol.setDrawDetailedCells(true);
        }

        gol.initGridCanvas('gol_canvas_grid');
    }
}

function zoomOutGol() {

    let cellSize = gol.getCellSize();
    if (cellSize > 1) {
        --cellSize;
        let canvasW = gol.getCanvasWidth();
        let canvasH = gol.getCanvasHeight();
        gol.setGridWidth(canvasW / cellSize);
        gol.setGridHeight(canvasH / cellSize);
        gol.setCellSize(cellSize);
        if (cellSize < 4) {
            gol.setDrawDetailedCells(false);
        }

        gol.initGridCanvas('gol_canvas_grid');
    }
}

function resetToDefaultZoom() {

    let cellSize = gol.getDefaultCellSize();
    gol.setCellSize(cellSize);
    let canvasW = gol.getCanvasWidth();
    let canvasH = gol.getCanvasHeight();
    gol.setGridWidth(canvasW / cellSize);
    gol.setGridHeight(canvasH / cellSize);
    gol.setDrawDetailedCells(true);
    hideAllSidePanes();
}

function updateCmdDisplay(id) {

    $('#' + id).css('display') == 'none' ? 
        $('#' + id).show(120, function() {
            $('#gol_canvas').css('margin-left', '360px');
            $('#gol_canvas_grid').css('margin-left', '360px');
            $('#gol_canvas_draw').css('margin-left', '360px');
            $('#gol_pattern_field').css('margin-left', '360px');
            $('#gol-cmd').css('margin-left', '360px');
        }) : $('#' + id).hide(120, function() {
            $('#gol_canvas').css('margin-left', '0px');
            $('#gol_canvas_grid').css('margin-left', '0px');
            $('#gol_canvas_draw').css('margin-left', '0px');
            $('#gol-cmd').css('margin-left', '0px');
            $('#gol_pattern_field').css('margin-left', '0px');
        });
}

function showDrawCanvas() {
    $('#gol_canvas_draw').show();
    $('.gol-pattern-cmd-items').show();
}

function hideDrawCanvas() {
    $('#gol_canvas_draw').hide();
    $('.gol-pattern-cmd-items').hide();
}

function hideAllSidePanes() {

    $('#multigol-clients').hide();
    $('#gol-library').hide();
    $('#gol_canvas').css('margin-left', '0px');
    $('#gol_canvas_grid').css('margin-left', '0px');
    $('#gol-cmd').css('margin-left', '0px');
    $('#gol_pattern_field').css('margin-left', '0px');
    $('#gol_canvas_draw').css('margin-left', '0px');
}

function hideAllIcons() {
    $('.gol-cmd-items').hide('fast');
}

function showAllIcons() {
    $('.gol-cmd-items').show('fast');
}