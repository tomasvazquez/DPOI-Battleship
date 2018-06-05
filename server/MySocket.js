exports.MySocket = function (id, user) {
    this.id = id;
    this.user = user;
    this.status = undefined;
    this.board = undefined;
    this.shootBoard = [];
    this.playId = undefined;
};
