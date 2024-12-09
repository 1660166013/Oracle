<template>
  <div id="app" class="container">
    <div class="input-section">
      <el-row :gutter="20" class="header">
        <el-col :span="24" class="text-center">
          <h1>古文字研究平台</h1>
        </el-col>
      </el-row>
      <!-- 查询类型选择和输入框 -->
      <el-row :gutter="20" justify="center" class="form-row">
        <el-col :span="6">
          <el-select v-model="searchType" placeholder="请选择查询类型" style="width: 100%;">
            <el-option label="按汉字" value="byPrefix"></el-option>
            <el-option label="按上古韵部" value="byAncientRhyme"></el-option>
            <el-option label="按上古声部" value="byAncientVoices"></el-option>
            <el-option label="按说文部首" value="bySpeakingRadicals"></el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-input v-model="query" :placeholder="placeholderText" clearable></el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="fetchCharacterDetails"
            :disabled="!query"
          >
            查询
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 查询结果展示 -->
    <div class="result-section" v-if="characterDetails && !characterDetails.error">
      <el-card class="info-box">
        <h3>查询结果</h3>
        <el-row>
          <el-col :span="6"><p><strong>上古韵部:</strong> {{ characterDetails.ancientRhyme }}</p></el-col>
          <el-col :span="6"><p><strong>上古声部:</strong> {{ characterDetails.ancientVoices }}</p></el-col>
          <el-col :span="6"><p><strong>说文部首:</strong> {{ characterDetails.speakingRadicals }}</p></el-col>
          <el-col :span="6"><p><strong>谐声偏旁:</strong> {{ characterDetails.harmonicSideways }}</p></el-col>
        </el-row>
      </el-card>

      <!-- 图像展示部分 -->
      <el-row :gutter="20" class="time-periods-container">
        <!-- 汉魏时期 -->
        <el-col :span="8" class="time-period-box">
          <el-card>
            <h3>汉魏时期</h3>
            <div v-if="filteredHanWeiImages.length">
              <el-row :gutter="10" justify="center" align="middle">
                <el-col
                  :span="24"
                  v-for="(image, index) in paginatedHanWeiImages"
                  :key="index"
                >
                  <div class="image-container">
                    <el-image
                      style="width: 120px; height: 120px;"
                      :src="image.hanWei"
                      fit="contain"
                    ></el-image>
                  </div>
                  <p class="text-center"><strong>著录:</strong> {{ image.bibliography1 || "无记录" }}</p>
                </el-col>
              </el-row>
              <div class="pagination">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="filteredHanWeiImages.length"
                  :page-size="itemsPerPage"
                  @current-change="hanWeiPage = $event"
                />
              </div>
            </div>
            <div v-else>
              <p class="text-center">暂无数据</p>
            </div>
          </el-card>
        </el-col>

        <!-- 唐宋时期 -->
        <el-col :span="8" class="time-period-box">
          <el-card>
            <h3>唐宋时期</h3>
            <div v-if="filteredTangSongImages.length">
              <el-row :gutter="10" justify="center" align="middle">
                <el-col
                  :span="24"
                  v-for="(image, index) in paginatedTangSongImages"
                  :key="index"
                >
                  <div class="image-container">
                    <el-image
                      style="width: 120px; height: 120px;"
                      :src="image.tangSong"
                      fit="contain"
                    ></el-image>
                  </div>
                  <p class="text-center"><strong>著录:</strong> {{ image.bibliography2 || "无记录" }}</p>
                </el-col>
              </el-row>
              <div class="pagination">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="filteredTangSongImages.length"
                  :page-size="itemsPerPage"
                  @current-change="tangSongPage = $event"
                />
              </div>
            </div>
            <div v-else>
              <p class="text-center">暂无数据</p>
            </div>
          </el-card>
        </el-col>

        <!-- 元明清时期 -->
        <el-col :span="8" class="time-period-box">
          <el-card>
            <h3>元明清时期</h3>
            <div v-if="filteredYuanMingQingImages.length">
              <el-row :gutter="10" justify="center" align="middle">
                <el-col
                  :span="24"
                  v-for="(image, index) in paginatedYuanMingQingImages"
                  :key="index"
                >
                  <div class="image-container">
                    <el-image
                      style="width: 120px; height: 120px;"
                      :src="image.yuanMingQing"
                      fit="contain"
                    ></el-image>
                  </div>
                  <p class="text-center"><strong>著录:</strong> {{ image.bibliography3 || "无记录" }}</p>
                </el-col>
              </el-row>
              <div class="pagination">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="filteredYuanMingQingImages.length"
                  :page-size="itemsPerPage"
                  @current-change="yuanMingQingPage = $event"
                />
              </div>
            </div>
            <div v-else>
              <p class="text-center">暂无数据</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 错误信息展示 -->
    <el-row justify="center" v-if="characterDetails && characterDetails.error">
      <el-empty :description="`查询失败，请稍后再试。`"></el-empty>
    </el-row>
  </div>
</template>

<script>
import {
  byPrefix,
  byAncientRhyme,
  byAncientVoices,
  bySpeakingRadicals,
} from "../../api/getword";

export default {
  data() {
    return {
      searchType: "byPrefix",
      query: "",
      characterDetails: null,
      hanWeiPage: 1,
      tangSongPage: 1,
      yuanMingQingPage: 1,
      itemsPerPage: 4,
      filteredHanWeiImages: [],
      filteredTangSongImages: [],
      filteredYuanMingQingImages: [],
    };
  },
  computed: {
    placeholderText() {
      switch (this.searchType) {
        case "byPrefix":
          return "请输入汉字";
        case "byAncientRhyme":
          return "请输入上古韵部";
        case "byAncientVoices":
          return "请输入上古声部";
        case "bySpeakingRadicals":
          return "请输入说文部首";
        default:
          return "请输入查询条件";
      }
    },
    paginatedHanWeiImages() {
      const start = (this.hanWeiPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredHanWeiImages.slice(start, end);
    },
    paginatedTangSongImages() {
      const start = (this.tangSongPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredTangSongImages.slice(start, end);
    },
    paginatedYuanMingQingImages() {
      const start = (this.yuanMingQingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredYuanMingQingImages.slice(start, end);
    },
  },
  methods: {
    async fetchCharacterDetails() {
      this.characterDetails = null;
      try {
        let data = {};
        switch (this.searchType) {
          case "byPrefix":
            data = await byPrefix(this.query);
            break;
          case "byAncientRhyme":
            data = await byAncientRhyme(this.query);
            break;
          case "byAncientVoices":
            data = await byAncientVoices(this.query);
            break;
          case "bySpeakingRadicals":
            data = await bySpeakingRadicals(this.query);
            break;
        }
        this.characterDetails = {
          ancientRhyme: data.ancientRhyme || "空",
          ancientVoices: data.ancientVoices || "空",
          speakingRadicals: data.speakingRadicals || "空",
          harmonicSideways: data.harmonicSideways || "空",
          images: data.images || [],
        };
        this.filteredHanWeiImages = this.characterDetails.images.filter(
          (image) => image.hanWei && image.hanWei !== "空"
        );
        this.filteredTangSongImages = this.characterDetails.images.filter(
          (image) => image.tangSong && image.tangSong !== "空"
        );
        this.filteredYuanMingQingImages = this.characterDetails.images.filter(
          (image) => image.yuanMingQing && image.yuanMingQing !== "空"
        );
      } catch (error) {
        this.characterDetails = { error: true };
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}

.header {
  margin-bottom: 20px;
}

.form-row {
  margin-bottom: 20px;
}

.result-section {
  margin-top: 20px;
}

.info-box {
  margin-bottom: 20px;
  padding: 15px;
}

.time-periods-container {
  margin-top: 20px;
}

.time-period-box {
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background-color: #ffffff;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.text-center {
  text-align: center;
  margin-top: 10px;
}

.pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
