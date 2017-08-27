/* global $ */
require('../../vendor/jquery-ui.min');
require('../../vendor/fancytree/jquery.fancytree.min');

$(function () {
    const initTree = function (data) {
        $('#taxonomyTree').fancytree({
            checkbox: false,
            selectMode: 3,
            extensions: ['dnd', 'edit', 'filter'],
            source: data,
            dnd: {
                autoExpandMS: 400,
                focusOnClick: true,
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                dragStart: function (node, data) {
                    return true;
                },
                dragEnter: function (node, data) {
                    return true;
                },
                dragDrop: function (dropNode, data) {
                    const dragNode = data.otherNode;
                    const parentNode = data.hitMode === 'over' ? dropNode : dropNode.getParent();
                    const parent = parentNode.data.taxonomyId || '';
                    let siblings = [];
                    (parentNode.getChildren() || []).forEach((v) => {
                        siblings.push(v.data.taxonomyId);
                    });
                    const isExist = siblings.indexOf(dragNode.data.taxonomyId);
                    if (isExist >= 0) {
                        siblings.splice(isExist, 1);
                    }
                    switch (data.hitMode) {
                        case 'over':
                            siblings.push(dragNode.data.taxonomyId);
                            break;
                        case 'before':
                            for (let i = 0; i < siblings.length; i += 1) {
                                if (siblings[i] === dropNode.data.taxonomyId) {
                                    siblings.splice(i, 0, dragNode.data.taxonomyId);
                                    break;
                                }
                            }
                            break;
                        case 'after':
                            for (let i = 0; i < siblings.length; i += 1) {
                                if (siblings[i] === dropNode.data.taxonomyId) {
                                    siblings.splice(i + 1, 0, dragNode.data.taxonomyId);
                                    break;
                                }
                            }
                            break;
                        default:
                    }
                    $.ajax({
                        type: 'post',
                        url: '/taxonomy/save',
                        data: {
                            taxonomyId: dragNode.data.taxonomyId,
                            parent,
                            siblings
                        },
                        headers: {
                            'X-CSRF-Token': $('#csrfToken').val()
                        },
                        dataType: 'json',
                        success: function (d) {
                            if (d.code === 0) {
                                dragNode.data.parent = d.data.parent;
                                dragNode.moveTo(dropNode, data.hitMode);
                                dropNode.setExpanded();
                            } else {
                                alert(d.message);
                            }
                        },
                        error: function () {
                            return false;
                        }
                    });
                    return false;
                }
            },
            edit: {
                /*
                 * 触发顺序：
                 *     beforeEdit->edit->beforeClose->save->close
                 * 5个事件的参数均相同
                 */
                triggerStart: ['f2', 'dblclick', 'shift+click', 'mac+enter'],
                beforeClose: function (event, data) {
                    console.log(1, data);
                    if (data.originalEvent && (data.originalEvent.type === 'blur' || data.originalEvent.type === 'mousedown') || !$(data.input).val().trim()) {
                        return false;
                    }
                },
                save: function (event, data) {
                    $.ajax({
                        type: 'post',
                        url: '/taxonomy/save',
                        data: {
                            name: $(data.input).val(),
                            parent: this.parent.isRootNode() ? '' : this.parent.data.taxonomyId,
                            taxonomyId: this.data.taxonomyId || ''
                        },
                        headers: {
                            'X-CSRF-Token': $('#csrfToken').val()
                        },
                        dataType: 'json',
                        success: function (d) {
                            delete data.node.data.isNew;
                            if (d.code === 0) {
                                if (d.data.taxonomyId) {
                                    data.node.data.taxonomyId = d.data.taxonomyId;
                                    data.node.data.isNew = true;
                                }
                                data.node.setTitle(d.data.name);
                                data.node.editEnd(false);
                                $(data.node.span).removeClass('pending');
                            } else {
                                alert(d.message);
                            }
                        },
                        error: function () {
                            return false;
                        }
                    });
                    return false;
                },
                close: function (event, data) {
                    console.log(2, data);
                    if (this.data && this.data.taxonomyId && !this.data.isNew) {
                        this.setFocus(true);
                        this.setActive(true);
                        if (!data.originalEvent || data.originalEvent.key !== 'Escape') {
                            $(data.node.span).addClass('pending');
                        }
                    } else {
                        this.setFocus(false);
                        this.setActive(false);
                        this.parent.setActive(true);
                        this.parent.folder = true;
                        this.parent.render();
                    }
                }
            },
            filter: {
                autoApply: true,
                autoExpand: false,
                counter: true,
                fuzzy: false,
                hideExpandedCounter: true,
                hideExpanders: false,
                highlight: true,
                leavesOnly: false,
                nodata: true,
                mode: 'dimm'
            },
            activate: function (event, data) {
                console.log(0, data.node.getChildren());
            },
            click: function (event, data) {
                if (data.node.isActive()) {
                    data.node.setActive(false);
                    data.node.setFocus(false);
                    $('#taxonomyTree').fancytree('getTree').rootNode.setActive(true);
                    return false;
                }
            }
        });
    };
    const initTreeEvent = function () {
        $('#btnCreate').on('click', function () {
            const catTree = $('#taxonomyTree').fancytree('getTree');
            const actNode = catTree.getActiveNode();
            // const curIdx = catTree.count();
            let curNode;
            if (actNode) {
                curNode = actNode.addChildren([{title: ''}]);
                actNode.setExpanded(true);
                actNode.folder = true;
                actNode.render();
            } else {
                curNode = catTree.rootNode.addChildren([{title: ''}]);
            }
            curNode.editStart();
            // const curNode = actNode || catTree.rootNode;
            // curNode.editCreateNode('child');
            return false;
        });
    };
    $.getJSON('/taxonomy/get', {}, function (data) {
        if (data.code === 0) {
            initTree(data.data);
            initTreeEvent();
        } else {
            alert(data.message);
        }
    });
});
