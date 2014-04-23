// access_token=34cdedf67068acc49d95f912d1523299913eeb6dc89dfd12b013d50fd8d5e4df4f7446072b09e17d22a52
// expires_in=86400
// user_id=14633991

var Token = (function () {
    function Token(hash) {
        this.hash = hash;
        var vals = hash.split("&");
        this.data = {};
        vals.forEach(function (s) {
            var keyValue = s.split("=");
            this.data[keyValue[0]] = keyValue[1];
        }.bind(this));
    }
    Token.getToken = function () {
        if (Token.instance != null)
            return Token.instance;

        if (window.location.hash == null || window.location.hash == "") {
            Token.auth();
            return null;
        }
        return Token.instance = new Token(window.location.hash);
    };
    Token.auth = function () {
        var wnd = window.open("https://oauth.vk.com/authorize?" + "client_id=4299761" + "&redirect_uri=https://oauth.vk.com/blank.html" + "&scope=12" + "&display=popup" + "&response_type=token");
    };

    Token.prototype.getAccessKey = function () {
        return this.data["#access_token"];
    };
    return Token;
})();

function args2str(args) {
    var res = "";
    for (var i in args) {
        if (res != "")
            res += "&";
        res += i + "=" + args[i];
    }
    return res;
}

function getQuery() {
    return window["jQuery"];
}

function api(method, args, callback) {
    var url = "https://api.vk.com/method/" + method + "?" + args2str(args) + "&callback=?";
    getQuery().getJSON(url, callback);
}

var Members = (function () {
    function Members() {
        this.data = [];
    }
    Members.collect = function (group_id, callback) {
        var members = new Members();

        var method = "groups.getMembers";
        var args = {
            group_id: group_id,
            sort: "id_asc",
            offset: 0,
            count: 1000
        };
        var c = { f: null };
        var f = function (data) {
            var resp = data.response;
            members.add(resp.users);
            var size = members.size();
            if (size >= resp.count)
                callback(members);
            else {
                args.offset = size;
                api(method, args, c.f);
            }
        };
        c.f = f;
        api(method, args, f);
    };

    Members.prototype.add = function (data) {
        this.data.push.apply(this.data, data);
    };

    Members.prototype.size = function () {
        return this.data.length;
    };

    Members.prototype.isMember = function (id) {
        for (var i in this.data) {
            if (id == this.data[i])
                return true;
        }
        return false;
    };
    return Members;
})();

var PhotoComments = (function () {
    function PhotoComments(photoId) {
        this.photoId = photoId;
        this.data = [];
    }
    PhotoComments.collect = function (owner_id, photo_id, callback) {
        var photos = new PhotoComments(photo_id);

        var method = "photos.getComments";
        var args = {
            owner_id: owner_id,
            photo_id: photo_id,
            offset: 0,
            count: 100,
            access_key: Token.getToken().getAccessKey(),
            access_token: Token.getToken().getAccessKey(),
            v: "5.20"
        };

        var c = { f: null };
        var f = function (data) {
            var resp = data.response;
            photos.add(resp.items);
            var size = photos.size();
            if (size >= resp.count)
                callback(photos);
            else {
                args.offset = size;
                api(method, args, c.f);
            }
        };
        c.f = f;
        api(method, args, f);
    };

    PhotoComments.prototype.add = function (datum) {
        this.data.push.apply(this.data, datum);
    };

    PhotoComments.prototype.size = function () {
        return this.data.length;
    };

    PhotoComments.prototype.getComments = function () {
        return this.data;
    };
    return PhotoComments;
})();
//# sourceMappingURL=token.js.map
