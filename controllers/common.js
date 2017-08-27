/**
 * 通用方法
 * @author fuyun
 * @since 2017/04/13.
 */
const models = require('../models/index');
const util = require('../helper/util');
const {sysLog: logger, formatOpLog} = require('../helper/logger');
const {Taxonomy} = models;

module.exports = {
    createCategoryTree: function (categoryData) {
        let catTree = {};
        let treeNodes = [];

        /**
         * 递归生成树节点
         * @param {Object} treeData 源数据
         * @param {String} parentId 父节点ID
         * @param {Object} parentNode 父节点
         * @param {Number} level 当前层级
         * @return {Undefined} null
         */
        function iterateCategory(treeData, parentId, parentNode, level) {
            for (let arrIdx = 0; arrIdx < treeData.length; arrIdx += 1) {
                let curNode = treeData[arrIdx];
                if (!treeNodes.includes(curNode.taxonomyId)) {
                    if (curNode.parent === parentId) {
                        parentNode[curNode.taxonomyId] = {
                            taxonomyId: curNode.taxonomyId,
                            name: curNode.name,
                            parentId: curNode.parent,
                            level: level,
                            children: {}
                        };
                        treeNodes.push(curNode.taxonomyId);
                        iterateCategory(treeData, curNode.taxonomyId, parentNode[curNode.taxonomyId].children, level + 1);
                    }
                }
            }
        }

        iterateCategory(categoryData, '', catTree, 1);
        return catTree;
    },
    getCategoryArray: function (catTree, outArr) {
        Object.keys(catTree).forEach((key) => {
            const curNode = catTree[key];
            outArr.push({
                level: curNode.level,
                name: curNode.name,
                taxonomyId: curNode.taxonomyId
            });
            if (!util.isEmptyObject(curNode.children)) {
                this.getCategoryArray(curNode.children, outArr);
            }
        });
        return outArr;
    },
    getCategoryTreeView: function (catTree, treeView, parent) {
        Object.keys(catTree).forEach((key) => {
            const curNode = catTree[key];
            const viewNode = {
                title: curNode.name,
                children: [],
                data: {
                    taxonomyId: curNode.taxonomyId,
                    parent: parent || ''
                }
            };
            treeView.push(viewNode);
            if (!util.isEmptyObject(curNode.children)) {
                viewNode.expanded = true;
                viewNode.folder = true;
                viewNode.unselectableStatus = false;
                viewNode.unselectableIgnore = true;
                this.getCategoryTreeView(curNode.children, viewNode.children, curNode.taxonomyId);
            }
        });
        return treeView;
    },
    getCategoryTree: function (cb) {
        Taxonomy.findAll({
            attributes: ['taxonomyId', 'name', 'parent', 'orderNo'],
            order: [
                ['orderNo', 'asc']
            ]
        }).then((data) => {
            if (data.length > 0) {
                const catTree = this.createCategoryTree(data);
                cb(null, {
                    catData: data,
                    catTree,
                    catArray: this.getCategoryArray(catTree, [])
                });
            } else {
                logger.warn(formatOpLog({
                    fn: 'getCategoryTree',
                    msg: '分类不存在'
                }));
                cb(null, {
                    catData: [],
                    catTree: {},
                    catArray: []
                });
            }
        });
    }
};
